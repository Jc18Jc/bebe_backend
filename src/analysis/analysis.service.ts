import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordService } from 'src/record/record.service';
import { BabyService } from 'src/baby/baby.service';
import { winstonLogger } from 'src/logger/winston-logger';
import { SecretAnalysisMethod } from './secret-analysis.method';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { JsonValue } from '@prisma/client/runtime/library';
import { generatePrompt, generateText } from 'src/public/prompts/analysis-prompt';
import { Analysis } from '@prisma/client';
import { RecordDto } from 'src/record/dto/record.dto';
import { generateDto } from 'src/utils/methods';
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class AnalysisService {
  private readonly analysisMapping: any;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly recordService: RecordService,
    private readonly babyService: BabyService,
    private readonly secretAnalysisMethod: SecretAnalysisMethod,
    private readonly authService: AuthService
  ) {
    this.analysisMapping = {
      recordId: 'recordId',
      color_evaluation: 'colorEvaluation',
      texture_evaluation: 'textureEvaluation',
      special_observations_evaluation: 'specialObservationsEvaluation',
      comprehensive_assessment: 'comprehensiveAssessment'
    };
  }
  
  async create(userUuid: string, createAnalysisDto: CreateAnalysisDto, language: string): Promise<AnalysisResultDto | JsonValue> {
    const { recordId, meals, question } = createAnalysisDto;

    const foodList = this.parseFoodList(meals);

    const record = await this.recordService.findOne(userUuid, recordId);
    if (!record) {
      throw new HttpException('존재하지 않는 레코드입니다.', 451);
    }
    
    const { uid, email } = await this.authService.getUidEmail(userUuid);

    let imageUrl = record?.originalImageUrl;

    // record에 오리지널 이미지가 없을 경우
    if (!imageUrl) {
      imageUrl = record?.imageUrl;
      // record에 리사이징된 이미지도 없을 경우
      if (!imageUrl) {
        throw new HttpException('존재하지 않는 이미지입니다.', 452);
      }
    }

    // 만약 분석한 기록이 있을 경우 기존의 결과 리턴
    const history = await this.prismaService.analysis.findUnique({
      where: { recordId }
    });
    if (history) {
      return history.result;
    }

    const babyId = record?.babyId;
    if (!babyId) {
      throw new HttpException('존재하지 않는 아기입니다.', 454);
    }

    let birthday = (await this.babyService.findOne(babyId))?.babyBirthday;
    if (!birthday) {
      birthday = new Date();
      birthday.setDate(birthday.getDate() - 1);
    }

    const diff = this.calcDay(record, birthday);

    const prompt = generatePrompt(language);
    const text = generateText(diff, foodList, question);

    const inputs = {
      Email: email,
      AuthId: uid,
      imageUrl,
      diff,
      foodList,
      question
    };

    const { resultDao, result } = await this.secretAnalysisMethod.analysis(prompt, text, imageUrl, language, inputs);

    try {
      const analysis = await this.prismaService.analysis.create({
        data: {
          ...resultDao,
          recordId,
          result,
          babyAgeInDays: diff,
          babyRecentMeals: foodList,
          parentConcerns: question
        }
      });

      return generateDto<Analysis, AnalysisResultDto>(analysis, this.analysisMapping);
    } catch (error) {
      const history = await this.prismaService.analysis.findUnique({
        where: { recordId }
      });
      if (history) {
        return history.result;
      }
      throw new HttpException('분석 중 에러가 발생했습니다.', 455, { cause: new Error(`analysis 생성 중 에러: ${error.message}`) });
    }
  }

  private parseFoodList(meals: string[]): string {
    try {
      if (meals) {
        return meals.join(', ');
      }
    } catch (error) {
      winstonLogger.error(`음식 리스트 파싱 중 에러 발생: ${error.message}`);

      return '';
    }
  }

  private calcDay(record: RecordDto, birthday: Date): number {
    const recordedDay = record?.startTime;
  
    if (!recordedDay) {
      return 0;
    }
  
    let diff = recordedDay.getTime() - birthday.getTime();
  
    if (!diff || diff <= 0) {
      return 0;
    }
    diff = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
    return diff;
  }

  
}

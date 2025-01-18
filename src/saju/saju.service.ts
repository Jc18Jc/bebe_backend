import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { getFullStemBranch, getYinYangFiveElements, getStemAndBranchInfo, generateParentInfo, generateTodayInfo } from './saju.method';
import { PrismaService } from 'src/prisma/prisma.service';
import { parentChildCompatibilityAnalysis, sajuHealthAnalysis, sajuTalentsAnalysis, traditionalSajuAnalysis, childWealthFortuneAnalysis, academicFortuneAnalysis, dailyFortuneAnalysis, monthlyFortuneAnalysis } from '../public/zod-schema';
import { generateHealthFortuneAnalysisPrompt, generateParentChildCompatibilityAnalysisPrompt, generateTraditionalSajuAnalysisPrompt, generateTraditionalSajuTalentsAnalysisPrompt, generateChildWealthFortuneAnalysisPrompt, generateTraditionalSajuAcademicFortuneAnalysisPrompt, generateDailyFortunePrompt, generateMonthlyFortunePrompt, generateTraditionalSajuAnalysisUserText } from 'src/public/prompts/saju-prompt';
import { SecretSajuMethod } from './secret-saju.method';
import { getTimeWithTimezone, stringToBuffer } from 'src/utils/methods';
import { RetSajuDto } from './dto/ret-saju.dto';
import { AuthService } from 'src/auth/auth.service';

type schema = 
  typeof traditionalSajuAnalysis | 
  typeof sajuTalentsAnalysis |
  typeof parentChildCompatibilityAnalysis |
  typeof sajuHealthAnalysis |
  typeof childWealthFortuneAnalysis |
  typeof academicFortuneAnalysis |
  typeof dailyFortuneAnalysis |
  typeof monthlyFortuneAnalysis;

interface FuncAndSchema {
  generatePrompt: () => string;
  schema: schema;
  schemaName: string;
}

@Injectable()
export class SajuService {
  constructor(private readonly prismaService: PrismaService, private readonly secretSajuMethod: SecretSajuMethod, private readonly authService: AuthService) { }

  async getTodaySaju(type: number, userUuid: string): Promise<RetSajuDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const saju = await this.prismaService.generalSajuAnalysis.findFirst({
      where: {
        userUuid: uuidBuffer,
        type
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!saju) {
      throw new NotFoundException('사주 분석 결과가 없습니다.');
    }

    return saju;
  }

  async createGeneral(createDto: any, userTimezone: string, language: string, userUuid: string, type: number): Promise<RetSajuDto> {
    this.checkRequiredFields(type, createDto);

    const { babyBirthday, babyGender, babyAgeInDays, parentBirthday, parentGender, parentAgeInDays } = this.extractUserData(createDto, type);

    const userName = this.getUserName(type);
    const isKorean = language === 'ko';

    const currentDate = getTimeWithTimezone(undefined, userTimezone);
    
    const babyLunarAge = getFullStemBranch(babyBirthday, isKorean);
    const yinYangFiveElementsJson = getYinYangFiveElements(babyLunarAge);
    const stemsAndBranchesInfo = getStemAndBranchInfo(babyLunarAge.split(' '));
    
    const isCompatibility = this.isCompatibilityType(type);
    
    let userText = generateTraditionalSajuAnalysisUserText(babyBirthday, babyLunarAge, babyAgeInDays, yinYangFiveElementsJson, babyGender, currentDate, stemsAndBranchesInfo, userName, isCompatibility);
    userText += this.generateAdditionalInfo(type, userTimezone, isKorean, parentBirthday, parentAgeInDays, parentGender, currentDate);

    const funcAndSchema = this.getgeneratePromptAndSchema(type, language);
    const { prompt, schema, schemaName } = funcAndSchema;

    const { uid, email, uuidBuffer } = await this.authService.getUidEmail(userUuid);

    const response = (await this.secretSajuMethod.generateResponse(prompt, schema, schemaName, userText, email, uid, type, createDto));

    await this.prismaService.generalSajuAnalysis.create({
      data: {
        userUuid: uuidBuffer,
        type: type,
        analysisResult: response
      }
    });

    return response;
  }

  private checkRequiredFields(type: number, createDto: any): void {
    const requiredFields = this.getRequiredFields(type);
    requiredFields.forEach((field: string) => {
      if (!createDto[field]) {
        throw new HttpException(`필수 입력값이 없습니다. ${field}`, 400);
      }
    });
  }

  private getRequiredFields(type: number): string[] {
    const requiredFields: Record<number, string[]> = {
      0: ['babyBirthday', 'babyGender', 'babyAgeInDays'],
      1: ['babyBirthday', 'babyGender', 'babyAgeInDays'],
      2: [
        'babyBirthday',
        'babyGender',
        'babyAgeInDays',
        'parentBirthday',
        'parentGender',
        'parentAgeInDays'
      ],
      3: ['babyBirthday', 'babyGender', 'babyAgeInDays'],
      4: ['babyBirthday', 'babyGender', 'babyAgeInDays'],
      5: ['babyBirthday', 'babyGender', 'babyAgeInDays'],
      6: ['userBirthday', 'userGender', 'userAgeInDays'],
      7: ['userBirthday', 'userGender', 'userAgeInDays']
    };

    return requiredFields[type] || [];
  }

  private getgeneratePromptAndSchema(type: number, language: string): { prompt: string, schema: schema, schemaName: string } {
    const FuncAndSchemaMap: Record<number, FuncAndSchema> = {
      0: {
        generatePrompt: () => generateTraditionalSajuAnalysisPrompt(language),
        schema: traditionalSajuAnalysis,
        schemaName: 'traditionalSajuAnalysis'
      },
      1: {
        generatePrompt: () => generateTraditionalSajuTalentsAnalysisPrompt(language),
        schema: sajuTalentsAnalysis,
        schemaName: 'sajuTalentsAnalysis'
      },
      2: {
        generatePrompt: () => generateParentChildCompatibilityAnalysisPrompt(language),
        schema: parentChildCompatibilityAnalysis,
        schemaName: 'parentChildCompatibilityAnalysis'
      },
      3: {
        generatePrompt: () => generateHealthFortuneAnalysisPrompt(language),
        schema: sajuHealthAnalysis,
        schemaName: 'sajuHealthAnalysis'
      },
      4: {
        generatePrompt: () => generateChildWealthFortuneAnalysisPrompt(language),
        schema: childWealthFortuneAnalysis,
        schemaName: 'childWealthFortuneAnalysis'
      },
      5: {
        generatePrompt: () => generateTraditionalSajuAcademicFortuneAnalysisPrompt(language),
        schema: academicFortuneAnalysis,
        schemaName: 'academicFortuneAnalysis'
      },
      6: {
        generatePrompt: () => generateDailyFortunePrompt(language),
        schema: dailyFortuneAnalysis,
        schemaName: 'dailyFortuneAnalysis'
      },
      7: {
        generatePrompt: () => generateMonthlyFortunePrompt(language),
        schema: monthlyFortuneAnalysis,
        schemaName: 'monthlyFortuneAnalysis'
      }
    };

    const { generatePrompt, schema, schemaName } = FuncAndSchemaMap[type] || { generatePrompt: () => '', schema: null, schemaName: '' };

    return { prompt: generatePrompt(), schema, schemaName };
  }

  private getUserName(type: number): string {
    if (type === 4) return "Individual's";
    if (type === 6 || type === 7) return "User's";

    return "Baby's";
  }

  private extractUserData(createDto: any, type: number): Record<string, any> {
    const { babyBirthday, babyGender, babyAgeInDays, parentBirthday, parentGender, parentAgeInDays, userBirthday, userGender, userAgeInDays } = createDto;

    if (type === 6 || type === 7) {
      return { babyBirthday: userBirthday, babyGender: userGender, babyAgeInDays: userAgeInDays };
    }

    return { babyBirthday, babyGender, babyAgeInDays, parentBirthday, parentGender, parentAgeInDays };
  }

  private isCompatibilityType(type: number): boolean {
    return type === 2 || type === 6 || type === 7;
  }
 

  private generateAdditionalInfo(type: number, userTimezone: string, isKorean: boolean, parentBirthday?: string, parentAgeInDays?: number, parentGender?: string, currentDate?: string): string {
    if (type === 6 || type === 7) {
      return generateTodayInfo(userTimezone, isKorean);
    } else if (type === 2) {
      return generateParentInfo(parentBirthday, parentAgeInDays, parentGender, currentDate, isKorean);
    }

    return '';
  }


}

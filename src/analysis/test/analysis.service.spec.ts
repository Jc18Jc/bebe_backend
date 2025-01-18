import { Test, TestingModule } from '@nestjs/testing';
import { RecordService } from 'src/record/record.service';
import { RecordDto } from 'src/record/dto/record.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BabyService } from 'src/baby/baby.service';
import { AnalysisResultDto } from '../dto/analysis-result.dto';
import { AnalysisService } from '../analysis.service';
import { AuthService } from 'src/auth/auth.service';
import { SecretAnalysisMethod } from '../secret-analysis.method';
import { CreateAnalysisDto } from '../dto/create-analysis.dto';
import { HttpException } from '@nestjs/common';

jest.mock('../analysis.Service', () => ({
  ...jest.requireActual('../analysis.service'),
  calcDay: jest.fn().mockReturnValue(1),
  parseFoodList: jest.fn().mockReturnValue('meal1, meal2'),
}));

jest.mock('src/utils/methods', () => ({ 
  ...jest.requireActual('src/utils/methods'),
  generateDto: jest.fn().mockImplementation((source, mapping) => {
    return new AnalysisResultDto({
      recordId: 1,
      color_evaluation: 'color_evaluation',
      texture_evaluation: 'texture_evaluation',
      special_observations_evaluation: 'special_observations_evaluation',
      comprehensive_assessment: 'comprehensive_assessment',
    });
  }),
}));

jest.mock('src/public/prompts/analysis-prompt', () => ({
  ...jest.requireActual('src/public/prompts/analysis-prompt'),
  generatePrompt: jest.fn().mockReturnValue('prompt'),
  generateText: jest.fn().mockReturnValue('text'),
}));

describe('AnalysisService', () => {
  let analysisService: AnalysisService;
  let recordService: RecordService;
  let prismaService: PrismaService;
  let secretAnalysisMethod: SecretAnalysisMethod;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: RecordService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ ...new RecordDto(), imageUrl: 'test', originalImageUrl: 'test', babyId: 1 })
          }
        },
        {
          provide: BabyService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ babyBirthday: '2021-01-01' },)
          }
        },
        {
          provide: PrismaService,
          useValue: {
            analysis: {
              findUnique: jest.fn(),
              create: jest.fn()
            }
          }
        },
        {
          provide: AuthService,
          useValue: {
            getUidEmail: jest.fn().mockResolvedValue({ uid: 1, email: 'email' })
          }
        },
        {
          provide: SecretAnalysisMethod,
          useValue: {
            analysis: jest.fn().mockReturnValue({ 
              resultDao: {
                color: 'color',
                colorEvaluation: 'colorEvaluation',
                texture: 'texture',
                textureEvaluation: 'textureEvaluation',
                specialObservations: 'specialObservations',
                specialObservationsEvaluation: 'specialObservationsEvaluation',
                comprehensiveAssessment: 'comprehensiveAssessment'
              }, 
              result:{
                color: 'color',
                color_evaluation: 'color_evaluation',
                texture: 'texture',
                texture_evaluation: 'texture_evaluation',
                special_observations: 'special_observations',
                special_observations_evaluation: 'special_observations_evaluation',
                comprehensive_assessment: 'comprehensive_assessment'
              }
            })
          }
        }
      ]
    }).compile();

    analysisService = module.get<AnalysisService>(AnalysisService);
    recordService = module.get<RecordService>(RecordService);
    prismaService = module.get<PrismaService>(PrismaService);
    secretAnalysisMethod = module.get<SecretAnalysisMethod>(SecretAnalysisMethod);
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
  });

  describe('create',  () => {
    const userUuid = 'uuid';
    const createAnalysisDto: CreateAnalysisDto = {
      recordId: 1,
      question: 'question',
    };
    const language = 'ko';
   
    it('정상 동작', async () => {
      const result = await analysisService.create(userUuid, createAnalysisDto, language);

      expect(result).toBeInstanceOf(AnalysisResultDto);
    });

    it('recordService findOne이 레코드를 찾지 못함', async () => {
      (recordService.findOne as jest.Mock).mockResolvedValue(undefined);

      expect(analysisService.create(userUuid, createAnalysisDto, language)).rejects.toThrow(
        expect.objectContaining({
          message: '존재하지 않는 레코드입니다.',
          status: 451
        }));
    });

    it('record에 imageUrl이 없음', async () => {
      (recordService.findOne as jest.Mock).mockResolvedValue({ ...new RecordDto(), babyID: 1 });

      expect(analysisService.create(userUuid, createAnalysisDto, language)).rejects.toThrow(
        expect.objectContaining({
          message: '존재하지 않는 이미지입니다.',
          status: 452
        }));
    });

    it('record에 babyId가 없음', async () => {
      (recordService.findOne as jest.Mock).mockResolvedValue({ ...new RecordDto(), imageUrl: 'test' });

      expect(analysisService.create(userUuid, createAnalysisDto, language)).rejects.toThrow(
        expect.objectContaining({
          message: '존재하지 않는 아기입니다.',
          status: 454
        })
      );
    });

    it('history가 있음', async () => {
      (prismaService.analysis.findUnique as jest.Mock).mockResolvedValue({ result: new AnalysisResultDto() });
      const result = await analysisService.create(userUuid, createAnalysisDto, language);

      expect(result).toBeInstanceOf(AnalysisResultDto);
      expect(secretAnalysisMethod.analysis).not.toHaveBeenCalled();
    });

    it ('prisma 저장 시 에러 & history 존재', async () => {
      (prismaService.analysis.create as jest.Mock).mockRejectedValue(new Error('prisma error'));
      (prismaService.analysis.findUnique as jest.Mock).mockResolvedValue({ result: new AnalysisResultDto() });

      const result = await analysisService.create(userUuid, createAnalysisDto, language);
      
      expect(result).toBeInstanceOf(AnalysisResultDto);
    });

    it ('prisma 저장 시 에러 & history 없음', async () => {
      (prismaService.analysis.create as jest.Mock).mockRejectedValue(new Error('prisma error'));
      (prismaService.analysis.findUnique as jest.Mock).mockResolvedValue(undefined);

      try {
        await analysisService.create(userUuid, createAnalysisDto, language);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('분석 중 에러가 발생했습니다.');
        expect(error.getStatus()).toBe(455);
      
        // cause 검증
        const causeError = error.cause as Error;
        expect(causeError).toBeInstanceOf(Error);
        expect(causeError.message).toBe('analysis 생성 중 에러: prisma error');
      }
    });
  });
});

import { ApiProperty } from '@nestjs/swagger';

class FeedingPatternAnalysisDto {
  @ApiProperty({ example: "좋네요", description: '하루에 섭취하는 우유 양' })
  dailyFeedingAmount: string;

  @ApiProperty({ example: "좋네요", description: '식사 빈도와 간격' })
  feedingFrequencyAndInterval: string;

  @ApiProperty({ example: 80, description: '급여 점수' })
  feedingScore: number;
}

class SleepPatternAnalysisDto {
  @ApiProperty({ example: "좋네요", description: '하루 수면 양' })
  dailySleepAmount: string;

  @ApiProperty({ example: "좋네요", description: '수면 주기' })
  sleepCycle: string;

  @ApiProperty({ example: "좋네요", description: '수면과 식사 간의 상관 관계' })
  sleepFeedingCorrelation: string;

  @ApiProperty({ example: 80, description: '수면 점수' })
  sleepScore: number;
}

class StoolAnalysisForDigestiveHealthDto {
  @ApiProperty({ example: "좋네요", description: '대변의 색상과 질감' })
  stoolColorAndTexture: string;

  @ApiProperty({ example: "좋네요", description: '음식과 대변의 관계' })
  foodStoolRelation: string;

  @ApiProperty({ example: 80, description: '소화 건강 점수' })
  digestiveHealthScore: number;
}

class ComprehensiveHealthEvaluationDto {
  @ApiProperty({ example: "좋네요", description: '영양 상태' })
  nutritionStatus: string;

  @ApiProperty({ example: "좋네요", description: '수면과 발달의 관계' })
  sleepDevelopmentRelation: string;

  @ApiProperty({ example: "좋네요", description: '소화 건강 예측' })
  digestiveHealthPrediction: string;

  @ApiProperty({ example: "좋네요", description: '전반적인 건강 추천' })
  overallHealthRecommendation: string;

  @ApiProperty({ example: 80, description: '전반적인 건강 점수' })
  overallHealthScore: number;
}

export class AnalysisResultDto {
  @ApiProperty({ type: FeedingPatternAnalysisDto, description: '급여 패턴 분석' })
  feedingPatternAnalysis: FeedingPatternAnalysisDto;

  @ApiProperty({ type: SleepPatternAnalysisDto, description: '수면 패턴 분석' })
  sleepPatternAnalysis: SleepPatternAnalysisDto;

  @ApiProperty({ type: StoolAnalysisForDigestiveHealthDto, description: '소화 건강을 위한 대변 분석' })
  stoolAnalysisForDigestiveHealth: StoolAnalysisForDigestiveHealthDto;

  @ApiProperty({ type: ComprehensiveHealthEvaluationDto, description: '종합 건강 평가' })
  comprehensiveHealthEvaluation: ComprehensiveHealthEvaluationDto;

  createdAt: Date;
}

export class RetReportDto {
  @ApiProperty({ type: AnalysisResultDto, description: '분석 결과' })
  analysisResult: AnalysisResultDto;
}

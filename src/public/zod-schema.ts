import { z, } from 'zod';

export const BabyHealthAnalysis = z.object({
  feedingPatternAnalysis: z.object({
    dailyFeedingAmount: z.string(),
    feedingFrequencyAndInterval: z.string(),
    feedingScore: z.number(),
  }),
  sleepPatternAnalysis: z.object({
    dailySleepAmount: z.string(),
    sleepCycle: z.string(),
    sleepFeedingCorrelation: z.string(),
    sleepScore: z.number(),
  }),
  stoolAnalysisForDigestiveHealth: z.object({
    stoolColorAndTexture: z.string(),
    foodStoolRelation: z.string(),
    digestiveHealthScore: z.number(),
  }),
  comprehensiveHealthEvaluation: z.object({
    nutritionStatus: z.string(),
    sleepDevelopmentRelation: z.string(),
    digestiveHealthPrediction: z.string(),
    overallHealthRecommendation: z.string(),
    overallHealthScore: z.number(),
  }),
});

export const WeeklyReportResult = z.object({
  alerts: z.array(z.object({
    type: z.string(),
    message: z.string(),
  })).nullable(),
  timeline: z.array(z.object({
    date: z.string(),
    time: z.string(),
    category: z.enum(['feeding', 'sleep', 'diaper',]),
    isWarning: z.boolean(),
    content: z.string(),
    detail: z.string(),
  })).nullable(),
  advice: z.array(z.string()),
  checkpoints: z.array(z.string()),
});

export const TranslationReportResult = z.object({
  alerts: z.array(z.object({
    type: z.string(),
    message: z.string(),
  })).nullable(),
  stats: z.object({
    feeding: z.object({
      breastfeeding: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      bottleFeeding: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      solidFood: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      total: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
    }),
    sleep: z.object({
      totalDaily: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      napTime: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      nightTime: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
    }),
    diaper: z.object({
      urination: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
      stool: z.object({
        average: z.number(),
        message: z.string(),
        change: z.number(),
      }),
    }),
  }),
  timeline: z.array(z.object({
    date: z.string(),
    time: z.string(),
    category: z.enum(['feeding', 'sleep', 'diaper',]),
    isWarning: z.boolean(),
    content: z.string(),
    detail: z.string(),
  })).nullable(),
  advice: z.array(z.string()),
  checkpoints: z.array(z.string()),
});

export const traditionalSajuAnalysis = z.object({
  "성장 운": z.string(),
  "건강 운": z.string(),
  "학업 운": z.string(),
  "친구 운": z.string(),
  "재능 발현 운": z.string(),
  "대운": z.string(),
  "성격 운": z.string(),
  "재물 운": z.string(),
  "직업 운": z.string(),
  "행운의 시기": z.string()
});

export const sajuTalentsAnalysis = z.object({
  "창의성": z.string(),
  "리더십": z.string(),
  "문제 해결 능력": z.string(),
  "사교성": z.string(),
  "신체 능력": z.string(),
  "학습 속도": z.string(),
  "감성 지능": z.string(),
  "음악적 재능": z.string(),
  "분석적 사고": z.string(),
  "미래 발전 가능성": z.string()
});

export const parentChildCompatibilityAnalysis = z.object({
  "아기와의 궁합": z.string(),
  "성격 궁합": z.string(),
  "수면 궁합": z.string(),
  "놀이 궁합": z.string(),
  "양육 궁합": z.string(),
  "감정 궁합": z.string(),
  "안정감 궁합": z.string(),
  "아기 스트레스 맞춤 조언": z.string(),
  "놀이 학습 궁합": z.string()
});

export const sajuHealthAnalysis = z.object({
  "오행의 균형": z.string(),
  "체질 분석": z.string(),
  "기운의 흐름": z.string(),
  "신체의 강약점": z.string(),
  "면역력": z.string(),
  "건강 주의 시기": z.string(),
  "음식 및 환경 관리": z.string(),
  "건강 위험 요소": z.string()
});

export const childWealthFortuneAnalysis = z.object({
  "재물 획득 능력": z.string(),
  "저축 성향": z.string(),
  "금전 관리 능력": z.string(),
  "재물의 안정성": z.string(),
  "부의 증식 가능성": z.string(),
  "풍요로운 생활 가능성": z.string(),
  "재물과 관련된 행운의 시기": z.string(),
  "재물 손실 위험 시기": z.string(),
  "투자 재능": z.string(),
  "재물운 개선을 위한 조언": z.string()
});

export const academicFortuneAnalysis = z.object({
  "학습 집중력": z.string(),
  "학습 의지": z.string(),
  "지적 호기심": z.string(),
  "기억력": z.string(),
  "문제 해결 능력": z.string(),
  "시험 성취도": z.string(),
  "교우 관계": z.string(),
  "교사와의 관계": z.string(),
  "학습 환경 적응력": z.string(),
  "장기적 학업 성취 가능성": z.string()
});

export const dailyFortuneAnalysis = z.object({
  "종합운": z.string(),
  "건강운": z.string(),
  "성장운": z.string(),
  "관계운": z.string(),
  "행운의 요소": z.string(),
  "주의사항": z.string(),
  "조언": z.string()
});

export const monthlyFortuneAnalysis = z.object({
  "종합운": z.string(),
  "건강운": z.string(),
  "성장운": z.string(),
  "관계운": z.string(),
  "행운의 요소": z.string(),
  "주의사항": z.string(),
  "조언": z.string()
});

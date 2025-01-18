import { ApiProperty } from "@nestjs/swagger";
import { JsonValue } from "@prisma/client/runtime/library";
import { TranslationReportResult } from "src/public/zod-schema";
import { z } from 'zod';

export class RetReportV2Dto {
  @ApiProperty({ example: 1 })
  weeklyReportId: number;

  @ApiProperty({ example: 1 })
  babyId: number;
  
  @ApiProperty({ example: {} })
  report: JsonValue;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  createdAt: Date;
}

export type WeeklyReportDto = z.infer<typeof TranslationReportResult>;

export class RetWeeklyReportDto {
  @ApiProperty({ example: [ { type: "🏥", message: "수유 기록이 없습니다." } ] })
  alerts: { type: string, message: string }[];

  @ApiProperty({ example: [
    {
      date: "2024-11-18",
      time: "10:34",
      category: "feeding",
      isWarning: true,
      content: "수유 기록 없음",
      detail: "아기가 분유를 수유했지만, 수량이 0ml로 기록되었습니다"
    } 
  ] })
  timeline: { 
    date: string,
    time: string,
    category: 'feeding' | 'sleep' | 'diaper',
    isWarning: boolean,
    content: string,
    detail: string
  }[];

  @ApiProperty({ example: ['열심히 수유하세요.'] })
  advice: string[];

  @ApiProperty({ example: [ '수유를 15번 이상 진행했는지 확인하세요.' ] })
  checkpoints: string[];

  @ApiProperty({ example: {
    feeding: {
      breastfeeding:{
        average: 120,
        message: "생후 50일 아기는 보통 1회 20ml, 하루 20회(총 200ml 먹어요. 현재 하루 총 120ml로 80ml 모자라요.",
        change: 50,
      },
      bottleFeeding: {
        average: 0,
        message: null,
        change: 0,
      },
      solidFood: {
        average: 0,
        message: null,
        change: 0,
      },
      total: {
        average: 120,
        message: "생후 50일 아기는 보통 1회 20ml, 하루 20회, 총 200ml 먹어요. 현재 하루 총 120ml로 80ml 모자라요.",
        change: 50,
      },
    },
    sleep: {
      totalDaily: {
        average: 700,
        message: "생후 50일 아기는 보통 1회 120분, 하루 6회, 총 720분 자요. 현재 하루 700분으로 충분해요",
        change: 60,
      },
      napTime: {
        average: 0,
        message: null,
        change: 0,
      },
      nightTime: {
        average: 0,
        message: null,
        change: 0,
      },
    },
    diaper: {
      urination: {
        average: 0,
        message: null,
        change: 0,
      },
      stool: {
        average: 0,
        message: null,
        change: 0,
      },
    },
  }
  })
  stats: {
    feeding: {
      breastfeeding:{
        average: number,
        message: string,
        change: number,
      },
      bottleFeeding: {
        average: number,
        message: string,
        change: number,
      },
      solidFood: {
        average: number,
        message: string,
        change: number,
      },
      total: {
        average: number,
        message: string,
        change: number,
      },
    },
    sleep: {
      totalDaily: {
        average: number,
        message: string,
        change: number,
      },
      napTime: {
        average: number,
        message: string,
        change: number,
      },
      nightTime: {
        average: number,
        message: string,
        change: number,
      },
    },
    diaper: {
      urination: {
        average: number,
        message: string,
        change: number,
      },
      stool: {
        average: number,
        message: string,
        change: number,
      },
    },
  };
}

import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";

export class CalendarPoopRecordDto {
  @ApiProperty({ example: 1 })
  recordId: number;

  @ApiProperty({ example: 5 })
  type: number;

  @ApiProperty({ example: "2024-06-11 10:34:48.554" })
  startTime: Date;

  @ApiProperty({ example: "2024-06-11 10:34:48.554" })
  endTime: Date;

  @ApiProperty({ example: "memo" })
  memo: string;

  @ApiProperty({ example: "www.naver.com" })
  imageUrl: string;

  @ApiProperty({ example: 1 })
  babyId: number;

  @ApiProperty({ example: { "color": "blue" } })
  attribute: Prisma.JsonValue;

  @ApiProperty({
    example: {
      result: {
        color: "",
        texture: "",
        color_evaluation: "",
        texture_evaluation: "",
        special_observations: "",
        comprehensive_assessment: "",
        special_observations_evaluation: ""
      }
    }
  })
  analysisResult?: { result: Prisma.JsonValue };
}

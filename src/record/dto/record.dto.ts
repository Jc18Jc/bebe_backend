import { ApiProperty } from "@nestjs/swagger";
import { JsonValue } from "@prisma/client/runtime/library";

export class RecordDto {
  @ApiProperty({ example: 1 })
  recordId: number;

  @ApiProperty({ example: 1 })
  type: number;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  startTime: Date;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  endTime: Date;

  @ApiProperty({ example: "memo" })
  memo: string;

  @ApiProperty({ example: "https://jjblog-bucket1.s3.ap-northeast-2.amazonaws.com/472345c2-2810-44bf-b2a0-a125dd87a331_unsplash10.jpg" })
  imageUrl: string;

  originalImageUrl?: string;

  @ApiProperty({ example: 1 })
  babyId: number;

  @ApiProperty({ example: { quantity: 20 } })
  attribute: JsonValue;

  @ApiProperty({
    example: {
      result: {
        color: "",
        texture: "",
        ccolor_evaluation: "",
        texture_evaluation: "",
        special_observations: "",
        comprehensive_assessment: "",
        special_observations_evaluation: ""
      }
    }
  })
  analysisResult?: { result: JsonValue };
}

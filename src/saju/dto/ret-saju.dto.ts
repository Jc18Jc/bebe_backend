import { ApiProperty } from "@nestjs/swagger";
import { JsonValue } from "@prisma/client/runtime/library";

export class RetSajuDto {
  @ApiProperty({ example: 1 })
  sajuId: number;

  analysisResult: JsonValue;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  createdAt: Date;

	@ApiProperty({ example: 1 })
  type: number;
}

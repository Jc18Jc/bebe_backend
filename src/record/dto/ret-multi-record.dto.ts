import { ApiProperty } from "@nestjs/swagger";

export class RetMultiRecordDto {
  @ApiProperty({ example: 2 })
  count: number;
}

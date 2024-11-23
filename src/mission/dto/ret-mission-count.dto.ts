import { ApiProperty } from "@nestjs/swagger";

export class RetMissionCountDto {
  @ApiProperty({ example: 1 })
  count: number;
}

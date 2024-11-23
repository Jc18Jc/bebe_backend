import { ApiProperty } from "@nestjs/swagger";

export class RetMissionDto {
  @ApiProperty({ example: '2021-08-01' })
  completionDay: string;

  @ApiProperty({ example: 1 })
  type: number;
}

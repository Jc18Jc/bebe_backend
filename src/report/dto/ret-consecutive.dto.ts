import { ApiProperty } from "@nestjs/swagger";

export class RetConsecutiveDto {
  @ApiProperty({ example: 3, description: '연속 기록 횟수' })
  consecutiveDays: number;
}

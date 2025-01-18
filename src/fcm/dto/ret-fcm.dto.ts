import { ApiProperty } from "@nestjs/swagger";

export class RetFcmDto {
  @ApiProperty({ example: 1, description: '성공한 fcm 개수' })
  success: number;

  @ApiProperty({ example: 0, description: '실패한 fcm 개수' })
  fail: number;
}

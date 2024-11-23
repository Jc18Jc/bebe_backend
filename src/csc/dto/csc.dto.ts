import { ApiProperty } from "@nestjs/swagger";

export class CscDto {
  @ApiProperty({ example: 1 })
  cscId: number;

  @ApiProperty({ example: 'yhtv2777@naver.com' })
  email: string;

  @ApiProperty({ example: '로그인이 안돼요 ㅜㅜ' })
  content: string;

  @ApiProperty({ example: false })
  isSolve: boolean;
}

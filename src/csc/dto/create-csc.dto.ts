import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCscDto {
  @ApiProperty({ example: 'yhtv2777@gmail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '로그인이 안돼요 흑흑' })
  @IsString()
  content: string;
}

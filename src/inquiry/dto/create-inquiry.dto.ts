import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateInquiryDto {
  @IsString()
  @ApiProperty({ example: '로그인이 안됩니다.' })
  title: string;

  @IsString()
  @ApiProperty({ example: '로그인이 안됩니다. 어떻게 해야하나요?' })
  content: string;
}

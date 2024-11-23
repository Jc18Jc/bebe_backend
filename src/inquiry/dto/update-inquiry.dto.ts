import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateInquiryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '로그인이 안됩니다.' })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '로그인이 안됩니다. 어떻게 해야하나요?' })
  content?: string;
}

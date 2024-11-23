import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendFcmsDto {
  @IsString()
  @ApiProperty({ example: "제목" })
  title: string;

  @IsString()
  @ApiProperty({ example: "내용" })
  message: string;

  @IsString()
  @ApiProperty({ example: "ko" })
  language: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SendFcmDto {
  @IsString()
  @ApiProperty({ example: "ABC123" })
  token: string;

  @IsString()
  @ApiProperty({ example: "제목" })
  title: string;

  @IsString()
  @ApiProperty({ example: "내용" })
  message: string;
}

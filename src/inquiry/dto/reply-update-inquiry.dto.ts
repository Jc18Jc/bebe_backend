import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class ReplyUpdateInquiryDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  inquiryId: number;

  @ApiProperty({ example: '잘하시면 됩니다.' })
  @IsString()
  reply: string;
}

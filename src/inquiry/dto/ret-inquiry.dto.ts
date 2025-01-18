import { ApiProperty } from "@nestjs/swagger";

export class RetInquiryDto {
  @ApiProperty({ example: 1 })
  inquiryId: number;

  @ApiProperty({ example: '로그인이 안됩니다.' })
  title: string;

  @ApiProperty({ example: '로그인이 안됩니다. 어떻게 해야하나요?' })
  content: string;

  @ApiProperty({ example: '2024-07-31T11:05:22.286Z' })
  createdAt: Date;

  @ApiProperty({ example: '잘하시면 됩니다.' })
  reply: string;
}

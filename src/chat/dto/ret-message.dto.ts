import { ApiProperty } from "@nestjs/swagger";

export class RetMessageDto {
  @ApiProperty({ example: 1 })
  messageId: number;

  @ApiProperty({ example: true })
  isUser: boolean;

  @ApiProperty({ example: '안녕하세요' })
  content: string;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  createdAt: Date;
}

export class RetMessageDtos {
  @ApiProperty({ example: [ { id: 1, isUser: true, content: '안녕하세요', createAt: "2024-07-31T11:05:22.286Z" }] })
  messages: RetMessageDto[];
}

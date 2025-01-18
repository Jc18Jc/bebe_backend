import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from './create-chat.dto';

export class CreateChatDtoV2 {
  @IsNumber()
  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({
    type: [Message],
    example: [{ role: 'user', content: '내 아기 어때 ?' }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];
}

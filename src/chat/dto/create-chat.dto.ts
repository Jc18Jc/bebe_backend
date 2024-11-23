import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class Message {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: '내 아기 어때 ?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CreateChatDto {
  @ApiProperty({
    type: [Message],
    example: [{ role: 'user', content: '내 아기 어때 ?' }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Message)
  messages: Message[];
}

import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SecretChatMethod } from './secret-chat.method';

@Module({
  controllers: [ChatController],
  providers: [ChatService, SecretChatMethod],
  exports: [ChatService]
})
export class ChatModule { }

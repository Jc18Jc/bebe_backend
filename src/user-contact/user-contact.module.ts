import { Module } from '@nestjs/common';
import { UserContactService } from './user-contact.service';
import { UserContactController } from './user-contact.controller';

@Module({
  controllers: [UserContactController],
  providers: [UserContactService]
})
export class UserContactModule {}

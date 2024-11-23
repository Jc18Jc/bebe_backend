import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { EventInviteController } from './invite-mapping.controller';
import { EventInviteService } from './invite-mapping.service';

@Module({
  imports: [AuthModule],
  controllers: [EventInviteController],
  providers: [EventInviteService],
  exports: [EventInviteService]
})
export class EventInviteModule {}

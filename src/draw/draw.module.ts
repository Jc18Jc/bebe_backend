import { Module } from '@nestjs/common';
import { DrawController } from './draw.controller';
import { DrawService } from './draw.service';
import { MissionModule } from 'src/mission/mission.module';
import { EventInviteModule } from 'src/event-Invite/invite-mapping.module';

@Module({
  imports: [EventInviteModule, MissionModule],
  controllers: [DrawController],
  providers: [DrawService]
})
export class DrawModule {}

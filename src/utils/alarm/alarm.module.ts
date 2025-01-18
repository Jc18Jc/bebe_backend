import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AlarmService } from './alarm.service';

@Module({
  imports: [HttpModule],
  providers: [AlarmService],
  exports: [AlarmService]
})
export class AlarmModule { }

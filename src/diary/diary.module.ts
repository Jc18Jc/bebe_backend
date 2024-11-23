import { Module } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { DiaryController } from './diary.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';
import { AlarmModule } from 'src/utils/alarm/alarm.module';

@Module({
  imports: [UserbabyModule, AlarmModule],
  controllers: [DiaryController],
  providers: [DiaryService]
})
export class DiaryModule {}

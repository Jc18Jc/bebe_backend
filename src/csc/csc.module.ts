import { Module } from '@nestjs/common';
import { CscService } from './csc.service';
import { CscController } from './csc.controller';
import { AlarmModule } from 'src/utils/alarm/alarm.module';

@Module({
  imports: [AlarmModule],
  controllers: [CscController],
  providers: [CscService],
  exports: [CscService]
})
export class CscModule { }

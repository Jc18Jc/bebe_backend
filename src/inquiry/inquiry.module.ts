import { Module } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { InquiryController } from './inquiry.controller';
import { AlarmModule } from 'src/utils/alarm/alarm.module';

@Module({
  imports: [AlarmModule],
  controllers: [InquiryController],
  providers: [InquiryService]
})
export class InquiryModule { }

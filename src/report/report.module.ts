import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';
import { AlarmModule } from 'src/utils/alarm/alarm.module';
import { AuthModule } from 'src/auth/auth.module';
import { SecretReportMethod } from './secret-report.method';
import { BabyModule } from 'src/baby/baby.module';
@Module({
  imports: [
    UserbabyModule,
    AlarmModule,
    AuthModule,
    BabyModule
  ],
  controllers: [ReportController],
  providers: [ReportService, SecretReportMethod],
  exports: [ReportService]
})
export class ReportModule { }

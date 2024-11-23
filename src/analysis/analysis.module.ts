import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { RecordModule } from 'src/record/record.module';
import { BabyModule } from 'src/baby/baby.module';
import { UserbabyModule } from 'src/userbaby/userbaby.module';
import { AlarmModule } from 'src/utils/alarm/alarm.module';
import { SecretAnalysisMethod } from './secret-analysis.method';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    RecordModule,
    BabyModule,
    UserbabyModule, 
    AlarmModule,
    AuthModule
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, SecretAnalysisMethod],
  exports: [AnalysisService]
})
export class AnalysisModule { }

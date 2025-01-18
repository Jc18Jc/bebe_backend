import { Module } from '@nestjs/common';
import { BabyModule } from './baby/baby.module';
import { UserModule } from './user/user.module';
import { UserbabyModule } from './userbaby/userbaby.module';
import { RecordModule } from './record/record.module';
import { AuthModule } from './auth/auth.module';
import { AnalysisModule } from './analysis/analysis.module';
import { InviteModule } from './invite/invite.module';
import { HealthcheckModule } from './healthcheck/healthcheck.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './utils/guards/jwt-auth.guard';
import { UuidThrottlerGuard } from './utils/guards/custom-throttler.guard';
import { PoopModule } from './poop/poop.module';
import { CustomExceptionFilter } from './utils/filters/exception.filter';
import { CscModule } from './csc/csc.module';
import { MealModule } from './meal/meal.module';
import { PreferModule } from './prefer/prefer.module';
import { ChatModule } from './chat/chat.module';
import { ReportModule } from './report/report.module';
import { InquiryModule } from './inquiry/inquiry.module';
import { CustomThrottlerStorage } from './utils/custom-throttler-storage';
import { Reflector } from '@nestjs/core';
import { AlarmModule } from './utils/alarm/alarm.module';
import { SajuModule } from './saju/saju.module';
import { FcmModule } from './fcm/fcm.module';
import { UserContactModule } from './user-contact/user-contact.module';
import { EventInviteModule } from './event-Invite/invite-mapping.module';
import { MissionModule } from './mission/mission.module';
import { DrawModule } from './draw/draw.module';
import { DiaryModule } from './diary/diary.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    BabyModule,
    UserModule,
    UserbabyModule,
    RecordModule,
    AuthModule,
    AnalysisModule,
    InviteModule,
    HealthcheckModule,
    ThrottlerModule.forRoot([
      {
        ttl: 86400000,
        limit: 3000
      }
    ]),
    PoopModule,
    CscModule,
    MealModule,
    PreferModule,
    ChatModule,
    ReportModule,
    InquiryModule,
    AlarmModule,
    SajuModule,
    FcmModule,
    UserContactModule,
    EventInviteModule,
    MissionModule,
    DrawModule,
    DiaryModule,
    CoreModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    CustomThrottlerStorage,
    {
      provide: APP_GUARD,
      useFactory: (throttlerStorage: CustomThrottlerStorage, reflector: Reflector) => {
        const options: ThrottlerModuleOptions = {
          throttlers: [{ limit: 3000, ttl: 86400000 }]
        };

        return new UuidThrottlerGuard(options, throttlerStorage, reflector);
      },
      inject: [CustomThrottlerStorage, Reflector]
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter
    },
  ]
})
export class AppModule { }

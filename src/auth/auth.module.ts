import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { SocialController } from './social.controller';
import { NaverStrategy } from './strategies/naver.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { SocialService } from './social.service';
import { RecordModule } from 'src/record/record.module';
import { FcmModule } from 'src/fcm/fcm.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN }
    }),
    RecordModule,
    FcmModule
  ],
  controllers: [AuthController, SocialController],
  providers: [
    AuthService,
    JwtStrategy,
    KakaoStrategy,
    AppleStrategy,
    NaverStrategy,
    GoogleStrategy,
    SocialService
  ],
  exports: [AuthService]
})
export class AuthModule { }

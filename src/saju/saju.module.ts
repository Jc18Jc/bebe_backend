import { Module } from '@nestjs/common';
import { SajuService } from './saju.service';
import { SajuController } from './saju.controller';
import { SecretSajuMethod } from './secret-saju.method';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [SajuController],
  providers: [SajuService, SecretSajuMethod]
})
export class SajuModule { }

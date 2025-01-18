import { Module } from '@nestjs/common';
import { BabyService } from './baby.service';
import { BabyController } from './baby.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/upload/multerOptions';
import { UserbabyModule } from 'src/userbaby/userbaby.module';

@Module({
  imports: [MulterModule.register(multerOptions), UserbabyModule],
  controllers: [BabyController],
  providers: [BabyService],
  exports: [BabyService]
})
export class BabyModule { }

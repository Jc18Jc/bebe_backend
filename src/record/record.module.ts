import { Module } from '@nestjs/common';
import { RecordService } from './record.service';
import { RecordController } from './record.controller';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from 'src/upload/multerOptions';
import { UserbabyModule } from 'src/userbaby/userbaby.module'; 
import { BabyModule } from 'src/baby/baby.module';

@Module({
  imports: [MulterModule.register(multerOptions), UserbabyModule, BabyModule],
  controllers: [RecordController],
  providers: [RecordService],
  exports: [RecordService]
})
export class RecordModule { }

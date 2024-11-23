import { Module } from '@nestjs/common';
import { PreferService } from './prefer.service';
import { PreferController } from './prefer.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';

@Module({
  imports: [UserbabyModule],
  controllers: [PreferController],
  providers: [PreferService],
  exports: [PreferService]
})
export class PreferModule { }

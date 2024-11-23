import { Module } from '@nestjs/common';
import { UserbabyController } from './userbaby.controller';
import { UserbabyService } from './userbaby.service';

@Module({
  controllers: [UserbabyController],
  providers: [UserbabyService],
  exports: [UserbabyService]
})
export class UserbabyModule { }

import { Module } from '@nestjs/common';
import { PoopService } from './poop.service';
import { PoopController } from './poop.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';

@Module({
  imports: [UserbabyModule],
  controllers: [PoopController],
  providers: [PoopService],
  exports: [PoopService]
})
export class PoopModule { }

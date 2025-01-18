import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';
import { BabyModule } from 'src/baby/baby.module';

@Module({
  imports: [UserbabyModule, BabyModule ],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService]
})
export class InviteModule { }

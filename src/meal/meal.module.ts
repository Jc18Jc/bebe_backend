import { Module } from '@nestjs/common';
import { MealService } from './meal.service';
import { MealController } from './meal.controller';
import { UserbabyModule } from 'src/userbaby/userbaby.module';
import { RecordModule } from 'src/record/record.module';

@Module({
  imports: [UserbabyModule, RecordModule ],
  controllers: [MealController],
  providers: [MealService],
  exports: [MealService]
})
export class MealModule { }

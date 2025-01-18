import { HttpException, Injectable } from '@nestjs/common';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { RecordService } from 'src/record/record.service';
import { getDayDates } from 'src/utils/methods';
import { Record } from '@prisma/client';
import { MealsDto } from './dto/ret-meals.dto';

@Injectable()
export class MealService {
  constructor(private readonly userBabyService: UserbabyService, private readonly recordService: RecordService) { }

  // attribute의 foods에 담긴 foodName을 받아 문자열로 반환
  recordsToFoods(records: Record[]): string[] {
    const foodNamesArray: string[] = [];
    try {
      records.forEach((record) => {
        if (record?.type === 3) {
          let attribute;
          attribute = record.attribute as { [key: string]: any };
          if (typeof record.attribute === 'string') {
            attribute = JSON.parse(record.attribute);
          } else {
            attribute = record.attribute;
          }
          const tmpList: string[] = [];
          // attribute와 foods가 존재하는지 확인
          if (attribute?.foods) {
            const foods = attribute.foods as { [key: string]: any };
            // foods가 객체인지 확인
            if (typeof foods === 'object' && !Array.isArray(foods)) {
              Object.keys(foods).forEach((recipeName) => {
                const recipe = foods[recipeName] as { [key: string]: any };
                // recipe가 객체인지 확인
                if (typeof recipe === 'object' && !Array.isArray(recipe)) {
                  Object.keys(recipe).forEach((foodName) => {
                    tmpList.push(`${foodName}`);
                  });
                } else if (typeof recipe === 'string' || typeof recipe === 'number') {
                  tmpList.push(`${recipeName}`);
                }
              });
            }
          }
          const tmpString = tmpList.join(', ');
          foodNamesArray.push(tmpString);
        } else if (record?.type === 1) {
          foodNamesArray.push(`모유`);
        } else if (record?.type === 2) {
          foodNamesArray.push(`분유`);
        } else if (record?.type === 10) {
          foodNamesArray.push(`우유`);
        } else if (record?.type === 16) {
          foodNamesArray.push(`유축 수유`);
        }
      });

      return foodNamesArray;
    } catch (error) {
      throw new HttpException(error?.message || 'foods 리스트 조회 중 에러', error?.status || 500);
    }
  }

  async findDailyMeals(userUuid: string, babyId: number, year: number, month: number, day: number, timeZone: string): Promise<MealsDto> {
    await this.userBabyService.userHasBaby(userUuid, babyId);

    const endDate = getDayDates(timeZone, `${year}-${month}-${day + 1}`).endDate;

    const mealRecords = await this.recordService.findFoodRecords(endDate, babyId, 100, 1);

    return { meals: this.recordsToFoods(mealRecords) } as MealsDto;

  }
 

  async findLatestMeals(userUuid: string, recordId: number): Promise<MealsDto> {
    const record = await this.recordService.findOne(userUuid, recordId);
    if (!record) {
      throw new HttpException('존재하지 않는 recordId 입니다.', 400);
    }
    record.startTime.setMinutes(record.startTime.getMinutes() + 1);
    const time = record.startTime;

    const mealRecords = await this.recordService.findFoodRecords(time, record.babyId, 3, 2);

    return { meals: this.recordsToFoods(mealRecords) } as MealsDto;
  }
}

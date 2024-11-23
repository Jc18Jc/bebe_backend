import { Controller, Get, Param, ParseIntPipe, Query, Headers } from '@nestjs/common';
import { MealService } from './meal.service';
import { CustomParseIntPipe } from 'src/utils/pipes/custom-parse-int.pipe';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MealsDto } from './dto/ret-meals.dto';
import { getDefaultDate } from 'src/utils/methods';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@Controller('meal')
@ApiTags('meal controller api')
@ApiBearerAuth('JWT Auth')
export class MealController {
  constructor(private readonly mealService: MealService) { }

  @Get('/:babyId')
  @ApiResponse({
    status: 200,
    type: MealsDto
  })
  @ApiOperation({ summary: '아기 일일 음식 조회 API' })
  async findAll(
    @Param('babyId', ParseIntPipe) babyId: number,
    @CurrentUser() user: CurrentUserDto,
    @Query('year', new CustomParseIntPipe(0)) year: number,
    @Query('month', new CustomParseIntPipe(0)) month: number,
    @Query('day', new CustomParseIntPipe(0)) day: number,
    @Headers('X-Timezone') timeZone: string = 'Asia/Seoul'
  ): Promise<MealsDto> {
    const { y, m, d } = getDefaultDate(timeZone);

    if (!year) {
      year = y;
    }
    if (!month) {
      month = m;
    }
    if (!day) {
      day = d;
    }

    return await this.mealService.findDailyMeals(user.uuid, babyId, year, month, day, timeZone);
  }

  @Get('/latest/:recordId')
  @ApiResponse({
    status: 200,
    type: MealsDto
  })
  @ApiOperation({ summary: '아기 똥 기준 음식 조회 API' })
  async findLatest(@CurrentUser() user: CurrentUserDto, @Param('recordId', ParseIntPipe) recordId: number): Promise<MealsDto> {
    return await this.mealService.findLatestMeals(user.uuid, recordId);
  }
}

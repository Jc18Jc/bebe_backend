import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { PoopService } from './poop.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomParseIntPipe } from 'src/utils/pipes/custom-parse-int.pipe';
import { GalleryPoopRecordDto } from './dto/gallery-poop-record.dto';
import { getDefaultDate } from 'src/utils/methods';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { CalendarPoopRecordDto } from './dto/calendar-poop-record.dto';

@ApiTags('poop controller api')
@ApiBearerAuth('JWT Auth')
@Controller('poop')
export class PoopController {
  constructor(private readonly poopService: PoopService) { }

  @Get('/gallery/:babyId')
  @ApiResponse({
    status: 200,
    type: [GalleryPoopRecordDto]
  })
  @ApiOperation({ summary: '갤러리용 똥 이미지 리스트 API' })
  findGallery(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number, @Query('page', new CustomParseIntPipe(1)) page?: number): Promise<GalleryPoopRecordDto[]> {
    const take = 52;
    const skip = (page - 1) * take;

    return this.poopService.queryGallery(user.uuid, babyId, skip, take);
  }


  @Get('/calendar/:babyId')
  @ApiResponse({
    status: 200,
    type: [CalendarPoopRecordDto]
  })
  @ApiOperation({ summary: '캘린더용 똥기록 리스트 API' })
  findCalendar(
    @CurrentUser() user: CurrentUserDto,
    @Param('babyId', ParseIntPipe) babyId: number,
    @Query('year', new CustomParseIntPipe(0)) year: number,
    @Query('month', new CustomParseIntPipe(0)) month: number,
    @Query('day', new CustomParseIntPipe(0)) day: number,
    @Query('timeZone') timeZone: string = 'Asia/Seoul',
  ): Promise<CalendarPoopRecordDto[]> {
    const { y, m } = getDefaultDate(timeZone);

    if (!year) {
      year = y;
    }
    if (!month) {
      month = m;
    }

    return this.poopService.queryCalendar(user.uuid, babyId, year, month, day, timeZone);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ParseIntPipe, Res, Headers } from '@nestjs/common';
import { RecordService } from './record.service';
import { CreateRecordDto, CreateRecordDtos } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecordDto } from './dto/record.dto';
import { Throttle } from '@nestjs/throttler';
import { multerOptions } from 'src/upload/multerOptions';
import { LastRecordDto } from './dto/last-record.dto';
import { FeedingAmountsDto } from './dto/feeding-amounts.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { RetMultiRecordDto } from './dto/ret-multi-record.dto';
import { CustomParseIntPipe } from 'src/utils/pipes/custom-parse-int.pipe';
import { getDefaultDate } from 'src/utils/methods';

@ApiTags('record controller api')
@Controller('record')
@ApiBearerAuth('JWT Auth')
export class RecordController {
  constructor(private readonly recordService: RecordService) { }

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiResponse({
    status: 201,
    type: RecordDto
  })
  @ApiOperation({ summary: '기록 생성 API' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  create(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Body() createRecordDto: CreateRecordDto): Promise<RecordDto> {
    return this.recordService.create(user.uuid, file, createRecordDto);
  }

  @Post('/multi')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @ApiResponse({
    status: 201,
    type: RetMultiRecordDto
  })
  @ApiOperation({ summary: '기록 다중 생성 API' })
  multiCreate(@Body() createRecordDtos: CreateRecordDtos): Promise<RetMultiRecordDto> {
    return this.recordService.multiCreate(createRecordDtos.records);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: RecordDto
  })
  @ApiOperation({ summary: '기록 수정 API' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  async update(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Param('id', ParseIntPipe) id: number, @Body() updateRecordDto: UpdateRecordDto): Promise<RecordDto> {
    return await this.recordService.update(user.uuid, file, id, updateRecordDto);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: RecordDto
  })
  @ApiOperation({ summary: '기록 조회 API' })
  async findOne(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number): Promise<RecordDto> {
    return await this.recordService.findOne(user.uuid, id);
  }

  @Get('/babyid/:babyId')
  @ApiResponse({
    status: 200,
    type: [RecordDto]
  })
  @ApiOperation({ summary: '기록 아기번호로 조회 API' })
  findByBabyId(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number, @Query('page', ParseIntPipe) page: number): Promise<RecordDto[]> {
    const take = 100;
    const skip = (page - 1) * take;

    return this.recordService.findByBabyId(user.uuid, babyId, skip, take);
  }

  @Get('/latest/:babyId')
  @ApiResponse({
    status: 200,
    type: LastRecordDto
  })
  @ApiOperation({ summary: '마지막 시간 조회 API' })
  findLatestRecords(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number, @Query('foodTimeType') foodTimeType: string = 'start', @Query('sleepTimeType') sleepTimeType: string = 'start') {
    return this.recordService.findLatestRecords(user.uuid, babyId, foodTimeType, sleepTimeType);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '기록 삭제 API' })
  async remove(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<Response> {
    await this.recordService.remove(user.uuid, id);

    return res.status(204).json({ message: "성공적으로 기록을 삭제했습니다." });
  }

  @Get('/feeding/:babyId')
  @ApiResponse({
    status: 200,
    type: FeedingAmountsDto
  })
  @ApiOperation({ summary: '수유량 조회 API' })
  async findFeeding(
    @CurrentUser() user: CurrentUserDto, 
    @Param('babyId', ParseIntPipe) babyId: number,
    @Query('year', new CustomParseIntPipe(0)) year: number,
    @Query('month', new CustomParseIntPipe(0)) month: number,
    @Query('day', new CustomParseIntPipe(0)) day: number, 
    @Headers('X-Timezone') timeZone: string = 'Asia/Seoul',
  ): Promise<FeedingAmountsDto> {
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

    return { feedingAmounts: await this.recordService.findFeeding(user.uuid, babyId, year, month, day, timeZone) };
  }

  @Get('/period/:babyId')
  @ApiResponse({
    status: 200,
    type: [RecordDto]
  })
  @ApiOperation({ summary: '입력된 기간 동안의 기록 조회 API, /record/period/{babyId}?start=2024-09-03T15:00Z&end=2024-09-07T15:00Z&type(디폴트 전체)=1,2,3' })
  findRecordPeriod(
    @CurrentUser() user: CurrentUserDto, 
    @Param('babyId', ParseIntPipe) babyId: number, 
    @Query('start') start: string, 
    @Query('end') end: string, 
    @Query('type') type: string = undefined
  ): Promise<RecordDto[]> {
    return this.recordService.findRecordPeriod(user.uuid, babyId, start, end, type);
  }
}

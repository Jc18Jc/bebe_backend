import { Body, Controller, Get, Headers, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RetReportDto } from './dto/ret-report.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { RetConsecutiveDto } from './dto/ret-consecutive.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { RetReportV2Dto,RetWeeklyReportDto, WeeklyReportDto } from './dto/ret-report-v2.dto';
import { number } from 'zod';

@Controller('report')
@ApiBearerAuth('JWT Auth')
@ApiTags('report controller api')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Post('weekly')
  @Throttle({ default: { ttl: 86400000, limit: 10 } })
  @ApiResponse({
    status: 201,
    type: RetReportDto
  })
  @ApiOperation({ summary: '레포트 분석 API' })
  async getWeeklyReport(
    @CurrentUser() user: CurrentUserDto,
    @Headers('X-Timezone') timeZone: string = 'Asia/Seoul',
    @Body() createReportDto: CreateReportDto,
    @Headers('accept-language') language: string,
  ): Promise<RetReportDto> {
    const { babyId } = createReportDto;
    const hasReport = await this.reportService.getTodayReport(babyId, timeZone);
    if (hasReport) {
      return { analysisResult: hasReport } as RetReportDto;
    }

    return this.reportService.analyzeWeeklyData(user.uuid, createReportDto, timeZone, language);
  }

  @Get('consecutive-days/:babyId')
  @ApiResponse({
    status: 200,
    type: RetReportDto || RetConsecutiveDto
  })
  @ApiOperation({ summary: '기록 연속 횟수 조회 API' })
  async getConsecutiveDays(@Param('babyId', ParseIntPipe) babyId: number, @Headers('X-Timezone') timeZone: string = 'Asia/Seoul'): Promise<RetReportDto | RetConsecutiveDto> {
    const hasReport = await this.reportService.getTodayReport(babyId, timeZone);
    if (hasReport) {
      return { analysisResult: hasReport } as RetReportDto;
    }
    const consecutiveDays = await this.reportService.getConsecutiveDays(babyId, timeZone);

    return { consecutiveDays } as RetConsecutiveDto;
  }

  @Get('list/:babyId')
  @ApiResponse({
    status: 200,
    type: [RetReportDto]
  })
  @ApiOperation({ summary: '레포트 리스트 조회 API' })
  getAllReports(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number,): Promise<RetReportDto[]> {
    return this.reportService.getAllReports(user.uuid, babyId);
  }

  @Get('consecutive-days-v2/:babyId')
  @ApiResponse({
    status: 200,
    type: number
  })
  @ApiOperation({ summary: 'V2-기록 연속 횟수 조회 API' })
  getConsecutiveDaysV2(@Param('babyId', ParseIntPipe) babyId: number, @Headers('X-Timezone') timeZone: string = 'Asia/Seoul'): Promise<number> {
    return this.reportService.getConsecutiveDaysV2(babyId, timeZone);
  }

  @Post('weekly-v2')
  @ApiResponse({
    status: 201,
    type: RetWeeklyReportDto
  })
  @ApiOperation({ summary: 'V2-레포트 분석 API' })
  generateReport(
    @Body() createReportDto: CreateReportDto, 
    @Headers('X-Timezone') timeZone: string = 'Asia/Seoul',
    @Headers('accept-language') language: string = 'ko', 
    @CurrentUser() user: CurrentUserDto
  ): Promise<WeeklyReportDto>  {
    return this.reportService.analyzeWeeklyDataV2(createReportDto.babyId, timeZone, language.slice(0, 2), createReportDto.babyAgeInDays, user.uuid);
  }

  @Get('list-v2/:babyId')
  @ApiResponse({
    status: 200,
    type: [RetReportV2Dto]
  })
  @ApiOperation({ summary: 'V2-레포트 리스트 조회 API' })
  getReportListV2(@Param('babyId', ParseIntPipe) babyId: number): Promise<RetReportV2Dto[]> {
    return this.reportService.getReportListV2(babyId);
  }
}

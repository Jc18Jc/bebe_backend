import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { getDate, getDayDates, getDiffDays, getStartOfDay, isSameDay } from 'src/utils/methods';
import { generateReportPrompt, generateText, generatePrompt } from 'src/public/prompts/report-prompt';
import { AnalysisResultDto, RetReportDto } from './dto/ret-report.dto';
import { AuthService } from 'src/auth/auth.service';
import { SecretReportMethod } from './secret-report.method';
import { Record, WeeklyReport } from '@prisma/client';
import { BabyService } from 'src/baby/baby.service';
import { WeeklyReportDto } from './dto/ret-report-v2.dto';

const types = [
  1,
  2,
  3,
  4,
  5,
  6,
  16,
  19
];

@Injectable()
export class ReportService {
  constructor(
    private prismaService: PrismaService,
    private readonly userbabyService: UserbabyService,
    private readonly authService: AuthService,
    private readonly secretReportMethod: SecretReportMethod,
    private readonly babyService: BabyService
  ) { }

  async analyzeWeeklyData(userUuid: string, createReportDto: CreateReportDto, timeZone: string, language: string): Promise<RetReportDto> {
    const { baby, dailyReport } = await this.getWeeklyData(userUuid, createReportDto, timeZone);

    const babyAgeInDays = getDiffDays(baby.babyBirthday);

    const prompt = generatePrompt(language);

    const text = generateText(baby, dailyReport, babyAgeInDays);

    const { uid, email } = await this.authService.getUidEmail(userUuid);

    const { analysisResult, data } = await this.secretReportMethod.generateReport(prompt, text, baby, email, uid);
    await this.prismaService.analysisReport.create({ data });

    return { analysisResult } as RetReportDto;
  }

  async getConsecutiveDays(babyId: number, timeZone: string, version: string = 'v1', date1?: Date, date2?: Date): Promise<number> {
    let startDate: Date, endDate: Date;
    if (version === 'v1') {
      startDate = getDayDates(timeZone, undefined, 6, 1). startDate;
      endDate = getDayDates(timeZone, undefined, 0, 1).endDate;
    } else {
      startDate = date1;
      endDate = date2;
    }

    const records = await this.getRecords(babyId, startDate, endDate);

    if (records.length === 0) {
      return 0;
    }

    let consecutiveDays = 0;
    for (let d = 0; d <= 6; d++) {
      const currentDate = getDayDates(timeZone, undefined, d, 1).startDate;
      const hasRecord = records.some((record) => isSameDay(record.startTime, currentDate, timeZone));
      if (hasRecord) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  async getWeeklyData(userUuid: string, createReportDto: CreateReportDto, timeZone: string): Promise<{ baby: any, dailyReport: any }> {
    const babyId = createReportDto.babyId;
    await this.userbabyService.userHasBaby(userUuid, babyId);

    const { startDate, endDate } = getDayDates(timeZone, undefined, 6, 1);

    const baby = await this.prismaService.baby.findUnique({
      where: { babyId }
    });

    if (!baby) {
      throw new HttpException('존재하지 않는 babyId', 400);
    }

    const records = await this.getRecords(babyId, startDate, endDate);

    const dailyDatas = this.secretReportMethod.processRecords(startDate, endDate, timeZone, records);

    const dailyReport = Object.values(dailyDatas);

    return { baby, dailyReport };
  }

  getRecords(babyId: number, startDate: Date, endDate: Date, version: string = 'v1'): Promise<Record[]> {
    return this.prismaService.record.findMany({
      where: {
        babyId,
        startTime: {
          gte: startDate,
          lt: endDate
        },
        type: version === 'v2' ? {
          in: types
        } : undefined
      },
      include: {
        analysisResult: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
  }

  async getTodayReport(babyId: number, timeZone: string): Promise<AnalysisResultDto | null> {
    const { startDate, endDate } = getDayDates(timeZone);
    startDate.setDate(startDate.getDate() + 1);
    endDate.setDate(endDate.getDate() + 1);
    const todayReport = await this.prismaService.analysisReport.findFirst({
      where: {
        babyId,
        createdAt: {
          gte: startDate,
          lt: endDate
        }
      }
    });

    if (todayReport) {
      return this.secretReportMethod.generateTodayReport(todayReport);
    }

    return null;
  }

  async getAllReports(userUuid: string, babyId: number): Promise<RetReportDto[]> {
    await this.userbabyService.userHasBaby(userUuid, babyId);
    const reports = await this.prismaService.analysisReport.findMany({
      where: { babyId },
      orderBy: { createdAt: 'desc' }
    });
    const transformedReports = reports.map((report) => {
      return { analysisResult: this.secretReportMethod.generateTodayReport(report) };
    });

    return transformedReports;
  }

  async analyzeWeeklyDataV2(babyId: number, timeZone: string, language: string, babyAgeInDays: number, userUuid: string): Promise<WeeklyReportDto> {
    const baby = await this.babyService.findOne(babyId);
    if (!baby) {
      throw new HttpException('존재하지 않는 아기입니다.', 400);
    }

    await this.userbabyService.userHasBaby(userUuid, babyId);

    const { startDate, endDate } = getDayDates(timeZone, undefined, 6, 1);
    const records = await this.getRecords(babyId, startDate, endDate, 'v2');

    const dailyDatas = this.secretReportMethod.processRecordsV2(startDate, endDate, timeZone, records);

    const previousWeeklyReport = await this.prismaService.weeklyReport.findFirst({
      where: { 
        babyId 
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    });

    const { userText: currentUserText, stats: currentStats } = this.secretReportMethod.generateReportUserText(dailyDatas, '이번주', babyAgeInDays);
    
    const ageSpecificGuidelines = this.secretReportMethod.getAgeSpecificGuidelines(babyAgeInDays, currentStats);

    const prompt = generateReportPrompt();

    const { uid, email } = await this.authService.getUidEmail(userUuid);
    
    const combinedReport = await this.secretReportMethod.generateReportV2(prompt, currentUserText, previousWeeklyReport, currentStats, ageSpecificGuidelines, baby, email, uid, language);
    
    await this.prismaService.weeklyReport.create({ data: { report: combinedReport, babyId } });
    
    return combinedReport;
  }

  async getConsecutiveDaysV2(babyId: number, timeZone: string): Promise<number> {
    const { startDate, endDate } = getDayDates(timeZone, undefined, 6, 1);
    const weeklyReport = await this.prismaService.weeklyReport.findFirst({
      where: {
        babyId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    let adjustedStartDate = getDate(startDate);
    if (weeklyReport) {
      const reportCreatedAt = getStartOfDay(weeklyReport.createdAt, timeZone);
      if (reportCreatedAt.isAfter(adjustedStartDate)) {
        adjustedStartDate = reportCreatedAt;
      }
    }

    return this.getConsecutiveDays(babyId, timeZone, 'v2', adjustedStartDate.toDate(), endDate);
  }

  async getReportListV2(babyId: number): Promise<WeeklyReport[]> {
    const reports = await this.prismaService.weeklyReport.findMany({ 
      where: { 
        babyId 
      }, 
      orderBy: { 
        createdAt: 'desc' 
      } 
    });

    return reports;
  }
}

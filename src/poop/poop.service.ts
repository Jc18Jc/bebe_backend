import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { GalleryPoopRecordDto } from './dto/gallery-poop-record.dto';
import { getDayDates, getMonthDates } from 'src/utils/methods';
import { CalendarPoopRecordDto } from './dto/calendar-poop-record.dto';

@Injectable()
export class PoopService {
  constructor(private readonly prismaService: PrismaService, private readonly userbabyService: UserbabyService) { }

  async queryGallery(uuid: string, babyId: number, skip: number, take: number): Promise<GalleryPoopRecordDto[]> {
    await this.userbabyService.userHasBaby(uuid, babyId);

    const poopRecords = await this.prismaService.record.findMany({
      where: {
        babyId,
        type: { in: [5, 19] },
        imageUrl: { not: "" }
      },
      orderBy: {
        startTime: 'desc'
      },
      skip,
      take,
      select: {
        recordId: true,
        imageUrl: true
      }
    });

    const poopRecordDtos: GalleryPoopRecordDto[] = poopRecords
      .filter(record => record.imageUrl !== null)
      .map(record => ({
        recordId: record.recordId,
        imageUrl: record.imageUrl
      } as GalleryPoopRecordDto));

    return poopRecordDtos;
  }

  // 캘린더 불러오기 및 일자별 조회
  async queryCalendar(uuid: string, babyId: number, year: number, month: number, day: number, timeZone: string): Promise<CalendarPoopRecordDto[]> {
    await this.userbabyService.userHasBaby(uuid, babyId);

    let startDate: Date;
    let endDate: Date;

    if (!day) { // 월별 조회
      // 해당 월의 시작
      startDate = getMonthDates(timeZone, year, month).startDate;
      // 다음 월의 시작
      endDate = getMonthDates(timeZone, year, month).endDate;
    } else { // 일자별 조회
      // 해당 일의 시작
      startDate = getDayDates(timeZone, `${year}-${month}-${day + 1}`).startDate;
      // 다음 일의 끝
      endDate = getDayDates(timeZone, `${year}-${month}-${day + 1}`).endDate;
    }

    const poopRecordDtos = await this.prismaService.record.findMany({
      where: {
        babyId: babyId,
        type: { in: [5,19] },
        startTime: {
          gte: startDate,
          lt: endDate
        }
      },
      select: {
        recordId: true,
        type: true,
        startTime: true,
        endTime: true,
        memo: true,
        imageUrl: true,
        babyId: true,
        attribute: true,
        analysisResult: {
          select: {
            result: true
          }
        }
      }
    });

    return poopRecordDtos;
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Record } from '@prisma/client';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { LastRecordDto } from './dto/last-record.dto';
import { RecordDto } from './dto/record.dto';
import { getDayDates, getTimeWithTimezone, getWeekBefore7Dates } from 'src/utils/methods';
import { BabyService } from 'src/baby/baby.service';
import { winstonLogger } from 'src/logger/winston-logger';
import saveFile from 'src/upload/upload-s3';
import deleteFile from 'src/upload/delete-s3';
import { RetMultiRecordDto } from './dto/ret-multi-record.dto';

const recordPrefixUrl = process.env.RECORD_IMAGE_PREFIX_URL;

@Injectable()
export class RecordService {
  private readonly select: Prisma.RecordSelect;
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userbabyService: UserbabyService,
    private readonly babyService: BabyService) {
    this.select = {
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
    };
  }

  async create(userUuid: string, file: Express.Multer.File, createRecordDto: CreateRecordDto): Promise<RecordDto> {
    await this.userbabyService.userHasBaby(userUuid, createRecordDto.babyId);

    const { originalFileUrl, resizedFileUrl } = await saveFile(file, recordPrefixUrl, true) as { originalFileUrl: string, resizedFileUrl: string };
    createRecordDto.imageUrl = resizedFileUrl;
    createRecordDto.originalImageUrl = originalFileUrl;
    
    const { startTime, endTime } = createRecordDto;

    if (startTime) {
      if (endTime && startTime > endTime) {
        throw new HttpException('종료 시간이 시작 시간보다 더 빠를 수 없습니다.', 400);
      }
      if (!endTime) {
        createRecordDto.endTime = startTime;
      }
    }

    const { attribute, ...data } = createRecordDto;

    let parseAttribute: Prisma.InputJsonValue;
    try {
      if (attribute) {
        parseAttribute = JSON.parse(attribute);
      }
    } catch (error) {
      throw new HttpException('attribute parsing 에러', 400, { cause: new Error(`attribute parsing error, error = ${error.message}, error status = ${error.status}`) });
    }

    const record = await this.prismaService.record.create({
      data: {
        ...data,
        attribute: parseAttribute
      },
      select: this.select
    });

    if (record.type === 18) {
      await this.updateBabyHeightAndWeight(record.recordId, record.babyId);
    }

    return record;
  }

  async multiCreate(createRecordDtos: CreateRecordDto[]): Promise<RetMultiRecordDto> {
    const result = await this.prismaService.$transaction(async (prismaService) => {
      return await prismaService.record.createMany({
        data: createRecordDtos
      });
    });
    const count = result?.count;

    if (count !== createRecordDtos.length) {
      throw new HttpException("일부 기록 생성에 실패했습니다.", 400);
    }

    return { count };

  }

  // 아이 번호로 기록 조회
  async findByBabyId(userUuid: string, babyId: number, skip: number, take: number): Promise<RecordDto[]> {
    await this.userbabyService.userHasBaby(userUuid, babyId);

    return await this.prismaService.record.findMany({
      where: {
        babyId
      },
      orderBy: {
        startTime: 'desc'
      },
      skip,
      take,
      select: { ...this.select, originalImageUrl: true }
    });

  }

  async findOne(userUuid: string, id: number): Promise<RecordDto> {
    const record = await this.prismaService.record.findUnique({
      where: {
        recordId: id,
      },
      select: this.select
    });

    if (!record) {
      throw new HttpException('존재하지 않는 record id', 400);
    }
    await this.userbabyService.userHasBaby(userUuid, record.babyId);

    return record;
  }

  async update(userUuid: string, file: Express.Multer.File, id: number, updateRecordDto: UpdateRecordDto): Promise<RecordDto> {
    await this.userbabyService.userHasBaby(userUuid, updateRecordDto.babyId);
    const { originalFileUrl, resizedFileUrl } = await saveFile(file, recordPrefixUrl, true) as { originalFileUrl: string, resizedFileUrl: string };
    updateRecordDto.imageUrl = resizedFileUrl ? resizedFileUrl : updateRecordDto.imageUrl;
    updateRecordDto.originalImageUrl = originalFileUrl ? originalFileUrl : updateRecordDto.originalImageUrl;

    const { babyId, attribute, ...data } = updateRecordDto;

    const record = await this.prismaService.record.findUnique({
      where: {
        recordId: id,
        babyId
      }
    });

    if (!record) {
      throw new HttpException('존재하지 않는 record id', 400);
    }

    let parseAttribute: Prisma.InputJsonValue;
    try {
      if (attribute) {
        parseAttribute = JSON.parse(attribute);
      }
    } catch (error) {
      throw new HttpException(error?.message || 'attribute를 Json으로 parse하는 과정 중 에러', error?.status || 400);
    }


    if (record?.imageUrl !== data?.imageUrl) {
      if (record?.imageUrl && record?.type !== 5) {
        deleteFile(record.imageUrl);
      }
    }

    if (record?.originalImageUrl !== data?.originalImageUrl) {
      if (record?.originalImageUrl && record?.type !== 5) {
        deleteFile(record.originalImageUrl);
      }
    }

    const retRecord = await this.prismaService.record.update({
      where: {
        recordId: id
      },
      data: {
        ...data,
        attribute: parseAttribute
      },
      select: this.select
    });

    if (retRecord?.type === 18) {
      await this.updateBabyHeightAndWeight(retRecord.recordId, retRecord.babyId);
    }

    return retRecord;
  }

  async remove(userUuid: string, id: number): Promise<void> {
    const record = await this.prismaService.record.findUnique({
      where: {
        recordId: id
      }
    });

    if (!record) {
      throw new HttpException('존재하지 않는 record id', 400);
    }

    await this.userbabyService.userHasBaby(userUuid, record.babyId);

    if (!(record.type === 5 || record.type === 19)) {
      if (record?.imageUrl) {
        await deleteFile(record.imageUrl);
      }
      if (record?.originalImageUrl) {
        await deleteFile(record.originalImageUrl);
      }
    }

    this.prismaService.record.delete({
      where: {
        recordId: id
      }
    });
  }

  // 기록 기준 음식 기록을 날짜로 조회
  async findFoodRecords(lastRecordTime: Date, babyId: number, take: number, limitDay: number): Promise<Record[]> {
    const limitTime = new Date(lastRecordTime);
    limitTime.setDate(limitTime.getDate() - limitDay);

    const { analysisResult, ...select2 } = this.select;

    return this.prismaService.record.findMany({
      where: {
        babyId,
        startTime: {
          lt: lastRecordTime,
          gt: limitTime
        },
        type: {
          in: [
            1,
            2,
            3,
            10,
            16
          ]
        }
      },
      take,
      orderBy: {
        startTime: 'desc'
      },
      select: select2
    });
  }

  // 최근 기록 조회  
  async findLatestRecords(userUuid: string, babyId: number, foodTimeType: string, sleepTimeType: string): Promise<LastRecordDto> {
    await this.userbabyService.userHasBaby(userUuid, babyId);

    const lastRecordDto = new LastRecordDto();

    const { record1, record2, record3, record4 } = await this.getLatestRecordsByTypeGroups(babyId, foodTimeType, sleepTimeType);

    if (record1) {
      lastRecordDto.foodTime = foodTimeType === 'start' ? record1.startTime : record1.endTime;
      lastRecordDto.foodType = record1.type;
      lastRecordDto.foodId = record1.recordId;
    }

    if (record2) {
      lastRecordDto.diaperTime = record2.startTime;
      lastRecordDto.diaperType = record2.type;
      lastRecordDto.diaperId = record2.recordId;
    }

    if (record3) {
      lastRecordDto.sleepingTime = sleepTimeType === 'start' ? record3.startTime : record3.endTime;
      lastRecordDto.sleepingId = record3.recordId;

      let attribute = record3.attribute as { [key: string]: any };
      if (typeof attribute === 'string') {
        attribute = JSON.parse(attribute);
      }
      if (Object.prototype.hasOwnProperty.call(attribute, 'sleepType')) {
        lastRecordDto.sleepType = attribute.sleepType;
      }
    }

    if (record4) {
      lastRecordDto.temperatureTime = record4.startTime;
      lastRecordDto.temperatureId = record4.recordId;

      const attributeStr = record4.attribute as { [key: string]: any };
      if (typeof attributeStr === 'string') {
        const attribute = JSON.parse(attributeStr);
        if (Object.prototype.hasOwnProperty.call(attribute, 'temperature')) {
          lastRecordDto.temperature = parseFloat(attribute.temperature);
        }
      } else if (typeof attributeStr === 'object') {
        lastRecordDto.temperature = parseFloat(attributeStr.temperature);
      }
    }

    return lastRecordDto;
  }

  // 마지막 시간 표시 기록 조회
  async getLatestRecordsByTypeGroups(babyId: number, foodTimeType: string, sleepTimeType: string): Promise<{ record1: Record, record2: Record, record3: Record, record4: Record }> {
    const foodTime = foodTimeType === 'start' ? 'startTime' : 'endTime';
    const sleepTime = sleepTimeType === 'start' ? 'startTime' : 'endTime';

    // 그룹별로 가장 최근의 record 찾기
    const group1Types = [
      1,
      2,
      3,
      16
    ]; // 모유, 분유, 수유, 유축 수유
    const group2Types = [4, 5, 19]; // 대변, 소변

    const record1 = await this.prismaService.record.findFirst({
      where: {
        type: {
          in: group1Types
        },
        babyId
      },
      orderBy: {
        [foodTime]: 'desc'
      }
    });

    const record2 = await this.prismaService.record.findFirst({
      where: {
        type: {
          in: group2Types
        },
        babyId
      },
      orderBy: {
        startTime: 'desc'
      }
    });

    const record3 = await this.prismaService.record.findFirst({
      where: {
        type: 6,
        babyId: babyId
      },
      orderBy: {
        [sleepTime]: 'desc'
      }
    });

    const record4 = await this.prismaService.record.findFirst({
      where: {
        type: 7,
        babyId
      },
      orderBy: {
        startTime: 'desc'
      }
    });


    return { record1, record2, record3, record4 };
  }

  async findFeeding(userUuid: string, babyId: number, year: number, month: number, day: number, timeZone: string): Promise<{ [key: string]: number }> {
    await this.userbabyService.userHasBaby(userUuid, babyId);

    const { startDate, endDate } = getDayDates(timeZone, `${year}-${month}-${day}`, 6, 0);

    const records = await this.prismaService.record.findMany({
      where: {
        type: {
          in: [2, 16]
        },
        startTime:
          {
            lt: endDate,
            gt: startDate
          },
        babyId
      },
      select: {
        recordId: true,
        startTime: true,
        attribute: true
      }
    });

    const amountList = getWeekBefore7Dates(year, month, day);

    records.forEach(record => {
      const dateToString = getTimeWithTimezone(record.startTime, timeZone);

      let amount = 0;
      if (record?.attribute) {
        const attribute = record.attribute as { [key: string]: any };
        amount = attribute?.amount || 0;
        if (typeof amount === 'string') {
          try {
            amount = parseInt(amount);
          } catch (error) {
            amount = 0;
          }
        }
      }
      if (!amountList[dateToString]) {
        amountList[dateToString] = 0;
      }
      amountList[dateToString] += amount;
    });

    return amountList;
  }

  // 가장 최근 측정 기록 조회
  findMeasurement(babyId: number): Promise<{ recordId: number, attribute: any }> {
    return this.prismaService.record.findFirst({
      where: {
        babyId,
        type: 18
      },
      orderBy: {
        startTime: 'desc'
      },
      select: {
        recordId: true,
        attribute: true
      }
    });
  }

  // 키, 몸무게에 변화가 있을 때 아기 프로필에 갱신
  async updateBabyHeightAndWeight(recordId: number, babyId: number): Promise<void> {
    const latestMeasurement = await this.findMeasurement(babyId);
    if (latestMeasurement?.recordId !== recordId) {
      return;
    }
    if (typeof latestMeasurement.attribute === 'object') {
      const attribute = latestMeasurement.attribute as { [key: string]: any };
      try {
        let height = attribute.height;
        let weight = attribute.weight;
        if (typeof height === 'string') {
          height = parseFloat(height);
        }
        if (typeof weight === 'string') {
          weight = parseFloat(weight);
        }
        this.babyService.updateWithWeightHeight(babyId, weight, height);
      } catch (error) {
        winstonLogger.error(`updateBabyHeightAndWeight 에러, error: ${error.message}`);
      }
    } else {
      return;
    }
  }

  // 기록 기간 조회
  async findRecordPeriod(userUuid: string, babyId: number, start: string, end: string, type: string): Promise<RecordDto[]> {
    await this.userbabyService.userHasBaby(userUuid, babyId);

    const startDate = new Date(start);
    const endDate = new Date(end);

    const typeList = type ? type.split(',').map(t => parseInt(t)) : undefined;

    return await this.prismaService.record.findMany({
      where: {
        babyId,
        startTime: {
          gte: startDate,
          lte: endDate
        },
        type: {
          in: typeList
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      select: this.select
    });

  }
}

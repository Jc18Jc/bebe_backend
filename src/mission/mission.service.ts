import { Injectable } from '@nestjs/common';
import { CreateMissionDto } from './dto/create-mission.dto';
import { getTimeWithTimezone, stringToBuffer } from 'src/utils/methods';
import { PrismaService } from 'src/prisma/prisma.service';
import { RetMissionDto } from './dto/ret-mission.dto';
import { RetMissionsDto } from './dto/ret-mission.dtos';
import { RetMissionCountDto } from './dto/ret-mission-count.dto';

@Injectable()
export class MissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userUuid: string, createMissionDto: CreateMissionDto, timezone: string): Promise<RetMissionDto> {
    const date = getTimeWithTimezone(undefined, timezone).toString();
    const uuidBuffer = stringToBuffer(userUuid);
    const type = createMissionDto.type;

    let missionCompletion: RetMissionDto;
    missionCompletion = await this.prismaService.missionCompletion.findUnique({
      where: {
        userUuid_type_completionDay: {
          userUuid: uuidBuffer,
          type,
          completionDay: date
        }
      },
      select: {
        type: true,
        completionDay: true
      }
    });

    if (!missionCompletion) {
      missionCompletion = await this.prismaService.missionCompletion.create({
        data: {
          userUuid: uuidBuffer,
          type,
          completionDay: date
        },
        select: {
          type: true,
          completionDay: true
        }
      });
    }

    return missionCompletion;
  }

  async findByDate(userUuid: string, date: string): Promise<RetMissionsDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const missions = await this.prismaService.missionCompletion.findMany({
      where: {
        userUuid: uuidBuffer,
        completionDay: date
      },
      select: {
        type: true,
        completionDay: true
      }
    });

    return { missions };
  }

  async count(userUuid: string): Promise<RetMissionCountDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const count = await this.prismaService.missionCompletion.count({
      where: {
        userUuid: uuidBuffer
      }
    });

    return { count };
  }

  countAll(): Promise<number>  {
    return this.prismaService.missionCompletion.count();
  }
}

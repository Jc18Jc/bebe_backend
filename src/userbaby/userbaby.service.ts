import { HttpException, Injectable } from '@nestjs/common';
import { UserBaby } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BabyDto } from 'src/baby/dto/baby.dto';
import { stringToBuffer } from 'src/utils/methods';
import { UserbabyWithUuidDto } from './dto/userbaby-wtih-uuid.dto';

@Injectable()
export class UserbabyService {
  constructor(private prismaService: PrismaService) { }

  async addBaby(userUuid: string, babyId: number, role: number): Promise<UserbabyWithUuidDto> {
    const uuidBuffer = stringToBuffer(userUuid);

    const userbaby = await this.prismaService.userBaby.findUnique({
      where: {
        userUuid_babyId: {
          userUuid: uuidBuffer,
          babyId
        }
      }
    });

    if (userbaby) {
      throw new HttpException('유저가 이미 해당 아이를 가지고 있음', 400);
    }

    try {
      return await this.prismaService.userBaby.create({
        data: {
          userUuid: uuidBuffer,
          babyId, 
          role
        },
        select: {
          userUuid: true,
          babyId: true,
          role: true
        }
      });
    } catch (error) {
      throw new HttpException('유저 혹은 아기 정보가 존재하지 않습니다.', 400);
    } 
  }

  async deleteBaby(uuid: string, babyId: number): Promise<void> {
    const userbaby = await this.userHasBaby(uuid, babyId);

    await this.prismaService.userBaby.delete({
      where: {
        userUuid_babyId: { userUuid: userbaby.userUuid, babyId }
      }
    });

  }

  async deleteBabyByUuid(userUuid: string): Promise<void> {
    const uuidBuffer = stringToBuffer(userUuid);

    await this.prismaService.userBaby.deleteMany({
      where: {
        userUuid: uuidBuffer
      }
    });
  }

  async findBabyList(userUuid: string): Promise<BabyDto[]> {
    const uuidBuffer = stringToBuffer(userUuid);

    const userWithBabies = await this.prismaService.user.findUnique({
      where: { uuid: uuidBuffer },
      include: {
        babies: {
          include: {
            baby: true
          }
        }
      }
    });

    if (!userWithBabies) {
      throw new HttpException('유저가 없거나 유저가 아이를 가지고 있지 않음', 400);
    }

    try {
      return userWithBabies.babies.map((userBaby) => {
        return userBaby.baby;
      });
    } catch (error) {
      throw new HttpException('유저의 아기 정보 조회 중 에러', 500);
    }
  }

  async userHasBaby(userUuid: string, babyId: number): Promise<UserBaby> {
    const uuidBuffer = stringToBuffer(userUuid);

    const userbaby = await this.prismaService.userBaby.findUnique({
      where: {
        userUuid_babyId: {
          userUuid: uuidBuffer,
          babyId: babyId
        }
      }
    });

    if (!userbaby) {
      throw new HttpException('user가 없거나 user가 해당 아이를 갖고 있지 않음', 400);
    }

    return userbaby;
  }
}

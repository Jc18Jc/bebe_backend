import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PreferDto } from './dto/prefer.dto';
import { Prisma } from '@prisma/client';
import { UserbabyService } from 'src/userbaby/userbaby.service';

@Injectable()
export class PreferService {
  private readonly select: Prisma.PreferSelect;
  constructor(private readonly prismaService: PrismaService, private readonly userbabyServcie: UserbabyService) {
    this.select = {
      babyId: true,
      foodId: true,
      type: true
    };
  }

  async findAll(userUuid: string, babyId: number): Promise<PreferDto[]> {
    await this.userbabyServcie.userHasBaby(userUuid, babyId);

    return this.prismaService.prefer.findMany({
      where: {
        babyId
      },
      orderBy: {
        foodId: 'asc'
      },
      select: this.select
    });
  }

  async create(userUuid: string, createPreferDto: PreferDto): Promise<PreferDto> {
    const { babyId, foodId, type } = createPreferDto;

    if (!babyId && !foodId && !type) {
      throw new HttpException('babyId 혹은 foodId 혹은 type이 없습니다.', 400);
    }

    await this.userbabyServcie.userHasBaby(userUuid, babyId);

    return this.prismaService.prefer.upsert({
      where: {
        babyId_foodId: {
          foodId,
          babyId
        }
      },
      update: {
        type
      },
      create: {
        foodId,
        babyId,
        type
      },
      select: this.select
    });

  }

  async remove(userUuid: string, babyId: number, foodId: number): Promise<void> {
    await this.userbabyServcie.userHasBaby(userUuid, babyId);

    try {
      await this.prismaService.prefer.delete({
        where: {
          babyId_foodId: {
            foodId,
            babyId
          }
        }
      });
    } catch (error) {
      throw new HttpException('존재하지 않는 선호도입니다.', 400, { cause: new Error(`선호도 삭제 실패, error: ${error}`) });
    }
  }
}

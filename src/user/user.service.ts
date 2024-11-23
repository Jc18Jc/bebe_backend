import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RetUserDto } from './dto/ret-user.dto';
import { stringToBuffer } from 'src/utils/methods';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly select: Prisma.UserSelect;
  constructor(private readonly prismaService: PrismaService, private readonly userbabyService: UserbabyService) {
    this.select = {
      userId: true,
      userName: true
    };
  }

  async create(createUserDto: CreateUserDto, userUuid: string): Promise<RetUserDto> {
    const uuidBuffer = stringToBuffer(userUuid);

    const user = await this.getUser(userUuid);

    if (user) {
      throw new HttpException('이미 존재하는 유저', 400);
    }

    return await this.prismaService.user.create({
      data: {
        ...createUserDto,
        uuid: uuidBuffer
      },
      select: this.select
    });
  }

  async findOne(userUuid: string): Promise<RetUserDto> {
    const user = await this.getUser(userUuid);

    if (!user) {
      throw new HttpException('존재하지 않는 유저', 400);
    }

    return user;
  }

  async getUser(userUuid: string): Promise<RetUserDto> {
    const uuidBuffer = stringToBuffer(userUuid);

    return this.prismaService.user.findUnique({
      where: {
        uuid: uuidBuffer
      },
      select: this.select
    });
  }

  update(userUuid: string, updateUserDto: UpdateUserDto): Promise<RetUserDto> {
    const uuidBuffer = stringToBuffer(userUuid);

    try {
      return this.prismaService.user.update({
        where: {
          uuid: uuidBuffer
        },
        data: updateUserDto,
        select: this.select
      });
    } catch (error) {
      throw new HttpException('유저 정보 업데이트 중 에러', 400, { cause: new Error(`유저 정보 업데이트 중 에러, error = ${error.message}`) });
    }
  }

  async remove(userUuid: string): Promise<void> {
    const uuidBuffer = stringToBuffer(userUuid);
    
    await this.userbabyService.deleteBabyByUuid(userUuid);

    await this.prismaService.user.delete({
      where: {
        uuid: uuidBuffer
      }
    });
  }
}

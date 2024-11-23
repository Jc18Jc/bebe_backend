import { HttpException, Injectable } from '@nestjs/common';
import { CreateCscDto } from './dto/create-csc.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AlarmService } from 'src/utils/alarm/alarm.service';

@Injectable()
export class CscService {
  constructor(private readonly prismaService: PrismaService, private readonly alarmService: AlarmService) { }

  async create(createCscDto: CreateCscDto) {

    const csc = await this.prismaService.csc.create({
      data: {
        ...createCscDto
      },
      select: {
        cscId: true,
        email: true,
        content: true,
        isSolve: true
      }
    });

    const text = `CSC \n 새로운 문의가 왔습니다, \n email: ${csc.email} \n message: ${csc.content}`;
    await this.alarmService.sendWebexMessage(text);

    return csc;
  }

  findAll() {
    return this.prismaService.csc.findMany({
      where: {
        isSolve: false
      },
      orderBy: {
        cscId: 'desc'
      },
      select: {
        cscId: true,
        email: true,
        content: true,
        isSolve: true
      }
    });
  }

  async solve(id: number) {
    try {
      await this.prismaService.csc.update({
        where: {
          cscId: id
        },
        data: {
          isSolve: true
        }
      });
    } catch (error) {
      throw new HttpException('존재하지 않는 문의 번호', 500, { cause: new Error(`문의 해결 중 에러, error=${error.message}`) });
    }
  }
}

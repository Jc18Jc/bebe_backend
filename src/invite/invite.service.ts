import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { InviteDto } from './dto/invite.dto';
import { BabyDto } from 'src/baby/dto/baby.dto';

@Injectable()
export class InviteService {
  constructor(private readonly prismaService: PrismaService, private readonly userbabyService: UserbabyService) { }

  async create(uuid: string, babyId: number): Promise<InviteDto> {
    await this.userbabyService.userHasBaby(uuid, babyId);

    // 0~999999 난수 생성
    let randNum: number = Math.floor(Math.random() * (1000000));

    const time = new Date();

    // 아직 데드라인을 안넘긴 초대 코드가 있다면 코드 넘버 다시 생성
    let i = 0;
    for (; i < 30; i++) {
      const inv = await this.prismaService.invite.findUnique({
        where: {
          inviteCode: randNum
        }
      });
      if (!inv || inv?.deadline < time) {
        break;
      }
      randNum = Math.floor(Math.random() * (1000000));
    }
    if (i === 30) {
      throw new HttpException('초대 코드를 생성할 수 없는 상황입니다.', 500);
    }

    await this.prismaService.invite.deleteMany({
      where: {
        inviteCode: randNum
      }
    });

    time.setMinutes(time.getMinutes() + 10);
    
    await this.prismaService.invite.create({
      data: {
        babyId,
        inviteCode: randNum,
        deadline: time
      }
    });

    const stringInviteCode = randNum.toString().padStart(6, '0');
    const inviteDto: InviteDto = { inviteCode: stringInviteCode };

    return inviteDto;
  }

  async findOne(inviteCode: string): Promise<BabyDto> {
    if (inviteCode.length !== 6) {
      throw new HttpException('6자리를 입력하세요.', 400);
    }
    let inviteBaby = null;
    try {
      inviteBaby = await this.prismaService.invite.findUnique({
        where: {
          inviteCode: +inviteCode
        }
      });
    } catch {
      throw new HttpException('숫자 형식을 입력하세요.', 400);
    }

    if (!inviteBaby) {
      throw new HttpException('존재하지 않는 코드입니다.', 400);
    }

    const currentTime = new Date();
    if (inviteBaby.deadline < currentTime) {
      throw new HttpException('시간이 지난 초대 코드입니다.', 400);
    }

    try {
      const result = await this.prismaService.baby.findUnique({
        where: {
          babyId: inviteBaby.babyId
        }
      });

      return result;
    } catch (error) {
      throw new HttpException('유효하지 않은 invite의 babyid', 400, { cause: new Error(`inviteCode의 babyId가 존재하지 않음, error: ${error.message}`) });
    }
  }
}

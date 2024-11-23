import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { stringToBuffer } from 'src/utils/methods';
import { RetUserContactDto } from './dto/ret-user-contact.dto';

@Injectable()
export class UserContactService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userUuid: string, createUserContactDto: CreateUserContactDto): Promise<RetUserContactDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const phoneNumber = createUserContactDto.phoneNumber;

    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new HttpException("전화번호 형식이 올바르지 않습니다.", 400);
    }

    const userContactFromUuid = await this.prismaService.userContact.findUnique({
      where: {
        userUuid: uuidBuffer
      }
    });

    if (userContactFromUuid) {
      throw new HttpException("이미 등록된 유저 정보입니다.", 400);
    }

    const userContactFromPhoneNumber = await this.prismaService.userContact.findUnique({
      where: {
        phoneNumber
      }
    });

    if (userContactFromPhoneNumber) {
      throw new HttpException("이미 등록된 전화번호입니다.", 400);
    }

    let randNum: number = Math.floor(Math.random() * (1000000));
    let sixCode = randNum.toString().padStart(6, '0');

    try {
      let i = 0;
      for (; i < 30; i++) {
        const uc = await this.prismaService.userContact.findUnique({
          where: {
            inviteCode: sixCode
          }
        });
        
        if (!uc) {
          break;
        }
        randNum = Math.floor(Math.random() * (1000000));
        sixCode = randNum.toString().padStart(6, '0');
      }
      if (i === 30) {
        throw new HttpException('초대 코드를 생성할 수 없는 상황입니다.', 500);
      }
    } catch (error) {
      throw new HttpException('초대 코드를 생성할 수 없는 상황입니다.', 500, { cause: new Error(`초대 코드를 생성할 수 없는 상황입니다. error=${error?.message}`) });
    }

    return this.prismaService.userContact.create({
      data: {
        inviteCode: sixCode,
        userUuid: uuidBuffer,
        phoneNumber
      },
      select: {
        inviteCode: true,
        phoneNumber: true
      }
    });
  }

  async findOne(userUuid: string): Promise<RetUserContactDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const uc = await this.prismaService.userContact.findUnique({
      where: {
        userUuid: uuidBuffer
      }
    });

    if (!uc) {
      throw new HttpException("존재하지 않는 유저 정보입니다.", 400);
    }

    return { inviteCode: uc.inviteCode, phoneNumber: uc.phoneNumber };
  }

  async update(userUuid: string, createUserContactDto: CreateUserContactDto): Promise<RetUserContactDto> {
    const uuidBuffer = stringToBuffer(userUuid);
    const phoneNumber = createUserContactDto.phoneNumber;

    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new HttpException("전화번호 형식이 올바르지 않습니다.", 400);
    }

    await this.findOne(userUuid);

    return this.prismaService.userContact.update({
      where: {
        userUuid: uuidBuffer
      },
      data: {
        phoneNumber
      },
      select: {
        inviteCode: true,
        phoneNumber: true
      }
    });
  }

  isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;

    return phoneRegex.test(phoneNumber);
  }
}

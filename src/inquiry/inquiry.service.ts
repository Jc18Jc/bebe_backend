import { HttpException, Injectable } from '@nestjs/common';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AlarmService } from 'src/utils/alarm/alarm.service';
import { stringToBuffer } from 'src/utils/methods';
import { CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { ReplyUpdateInquiryDto } from './dto/reply-update-inquiry.dto';

@Injectable()
export class InquiryService {
  private readonly select: Prisma.InquirySelect;
  constructor(private readonly prismaService: PrismaService, private readonly alarmService: AlarmService) {
    this.select = {
      inquiryId: true,
      createdAt: true,
      title: true,
      content: true,
      reply: true
    };
  }

  async create(user: CurrentUserDto, createInquiryDto: CreateInquiryDto) {
    const { uuid, email } = user;
    const uuidBuffer = stringToBuffer(uuid);

    const { content, title } = createInquiryDto;

    const text = `Inquiry \n 새로운 문의가 왔습니다, \n email: ${email} \n title: ${title} \n content: ${content}`;
    await this.alarmService.sendWebexMessage(text);

    return await this.prismaService.inquiry.create({
      data: {
        userUuid: uuidBuffer,
        content,
        title
      },
      select: this.select
    });
  }

  findIndividualAll(uuid: string) {
    const uuidBuffer = stringToBuffer(uuid);

    return this.prismaService.inquiry.findMany({
      where: {
        userUuid: uuidBuffer
      },
      select: this.select,
      orderBy: {
        inquiryId: 'desc'
      }
    });

  }

  async findOne(userUuid: string, id: number) {
    const uuidBuffer = stringToBuffer(userUuid);
    const inquiry = await this.prismaService.inquiry.findUnique({
      where: {
        inquiryId: id,
        userUuid: uuidBuffer
      },
      select: this.select
    });
    if (!inquiry) {
      throw new HttpException('없는 문의 번호입니다.', 400);
    }

    return inquiry;

  }

  update(userUuid: string, id: number, updateInquiryDto: UpdateInquiryDto) {
    const uuidBuffer = stringToBuffer(userUuid);
    try {
      return this.prismaService.inquiry.update({
        where: {
          inquiryId: id,
          userUuid: uuidBuffer
        },
        data: {
          ...updateInquiryDto
        },
        select: this.select
      });
    } catch (error) {
      throw new HttpException('없는 문의 번호입니다.', 400);
    }
  }

  async remove(id: number) {
    try {
      await this.prismaService.inquiry.delete({
        where: {
          inquiryId: id
        }
      });
    } catch (error) {
      throw new HttpException('없는 문의 번호입니다.', 400);
    }
  }


  // ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 관리자 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
  adminFindAll() {
    return this.prismaService.inquiry.findMany({
      select: this.select,
      orderBy: {
        inquiryId: 'desc'
      }
    });
  }
  
  async adminFindOne(id: number) {
    const inquiry = await this.prismaService.inquiry.findUnique({
      where: {
        inquiryId: id
      },
      select: this.select
    });
    if (!inquiry) {
      throw new HttpException('없는 문의 번호입니다.', 400);
    }

    return inquiry;
  }
  
  adminUpdateReply(reqplyUpdateInquiryDto: ReplyUpdateInquiryDto) {
    const { inquiryId, reply } = reqplyUpdateInquiryDto;

    try {
      return this.prismaService.inquiry.update({
        where: {
          inquiryId
        },
        data: {
          reply
        },
        select: this.select
      });
    } catch (error) {
      throw new HttpException('없는 문의 번호 혹은 잘못된 데이터', error?.status);
    }
  }
}

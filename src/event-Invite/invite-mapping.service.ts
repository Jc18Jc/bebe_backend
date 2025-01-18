import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { stringToBuffer } from 'src/utils/methods';
import { RetMappingEmailDtos } from './dto/ret-mapping-email.dtos';
import { RetIsRegisterDto } from './dto/ret-is-Register.dto';
import { AuthService } from 'src/auth/auth.service';
import { EventInvite, UserContact } from '@prisma/client';
import { CreateEventInviteDto } from './dto/create-invite-mapping.dto';
import { RetEventInviteDto } from './dto/ret-invite-mapping.dto';

@Injectable()
export class EventInviteService {
  constructor(private readonly prismaService: PrismaService, private readonly authService: AuthService) {}

  async checkInviteCodeValidity(inviteCode: string): Promise<UserContact> {
    const userContact = await this.prismaService.userContact.findUnique({
      where: {
        inviteCode
      }
    });
    
    if (!userContact) {
      throw new HttpException('존재하지 않는 초대 코드입니다.', 400);
    }

    return userContact;
  }

  checkSelfInvite(userContactUserUuid: Buffer, uuidBuffer: Buffer) {
    if (userContactUserUuid.equals(uuidBuffer)) {
      throw new HttpException('자신의 초대 코드는 사용할 수 없습니다.', 400);
    }
  }

  async register(userUuid: string, createInviteMappingDto: CreateEventInviteDto): Promise<RetEventInviteDto> {
    const userContact = await this.checkInviteCodeValidity(createInviteMappingDto.inviteCode);
    
    const uuidBuffer = stringToBuffer(userUuid);
    const userContactUserUuid = userContact.userUuid;
    this.checkSelfInvite(userContactUserUuid, uuidBuffer);

    const { isMapping, invitedEmail, provider } = await this.checkExistingMapping(uuidBuffer);

    if (isMapping) {
      throw new HttpException('이미 등록된 이메일입니다.', 400);
    }

    await this.prismaService.eventInvite.create({
      data: {
        invitedEmail,
        provider,
        userUuid: userContactUserUuid
      }
    });

    return this.prismaService.user.findUnique({
      where: {
        uuid: userContactUserUuid
      },
      select: {
        userName: true
      }
    });
  }

  async findAll(userUuid: string): Promise<RetMappingEmailDtos> {
    const uuidBuffer = stringToBuffer(userUuid);

    const mappingInfo = await this.prismaService.eventInvite.findMany({
      where: {
        userUuid: uuidBuffer
      },
      select: {
        invitedEmail: true
      }
    });

    const emailList = mappingInfo.map((info) => info.invitedEmail);

    return { emailList, count: emailList.length };
  }

  countAll() {
    return this.prismaService.eventInvite.count();
  }

  async isRegister(userUuid: string): Promise<RetIsRegisterDto> {
    const uuidBuffer = stringToBuffer(userUuid);

    const { isMapping } = await this.checkExistingMapping(uuidBuffer);

    return { isRegister: !!isMapping };
  }

  async checkExistingMapping(uuidBuffer: Buffer): Promise<{isMapping: EventInvite, invitedEmail: string, provider: string}> {
    const { email: invitedEmail, provider } =  await this.authService.getEmailProvider(uuidBuffer);

    const isMapping = await this.prismaService.eventInvite.findUnique({
      where: {
        invitedEmail_provider: {
          invitedEmail,
          provider
        }
      }
    });

    return { isMapping, invitedEmail, provider }; 
  }
}

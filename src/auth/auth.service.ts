import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { bufferToString, stringToBuffer } from 'src/utils/methods';
import { AuthDto } from './dto/auth.dto';
import { Auth } from '@prisma/client';
import { TokenDto } from './dto/token.dto';
import { FcmService } from 'src/fcm/fcm.service';
import { SignDto } from './dto/sign.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prismaService: PrismaService, private readonly fcmService: FcmService) { }

  generateAuthDto(auth: Auth): AuthDto {
    return {
      email: auth.email,
      provider: auth.provider,
      uuid: bufferToString(auth.uuid),
      id: auth.authId
    } as AuthDto;
  }

  async validateUser(email: string, provider: string): Promise<AuthDto | null> {
    const auth = await this.prismaService.auth.findUnique({
      where: {
        email_provider: {
          email,
          provider
        }
      }
    });
    if (!auth) {
      return null;
    }
    
    return this.generateAuthDto(auth);
  }

  async validateByUuid(uuid: string): Promise<AuthDto> {
    const uuidBuffer = stringToBuffer(uuid);

    const auth = await this.prismaService.auth.findUnique({
      where: {
        uuid: uuidBuffer
      }
    });

    if (!auth) {
      throw new HttpException('가입되지 않은 회원', 401);
    }

    return this.generateAuthDto(auth);
  }

  private async registerDevice(uuid: string, deviceToken: string, language: string): Promise<void> {
    if (deviceToken) {
      await this.fcmService.registerDevice(uuid, deviceToken, language);
    }
  }

  async signIn(uuid: string, deviceToken: string = null, language: string = 'ko'): Promise<TokenDto> {
    const tokenDto = await this.generateToken(uuid);

    await this.registerDevice(uuid, deviceToken, language);

    return tokenDto;
  }

  async signUp(signDto: SignDto, language: string = 'ko'): Promise<TokenDto> {
    const uuid = uuidv4();
    const uuidBuffer = stringToBuffer(uuid);

    const {  deviceToken, ...authDto } = signDto;

    await this.prismaService.auth.create({
      data: {
        ...authDto,
        uuid: uuidBuffer
      }
    });

    const tokenDto = await this.generateToken(bufferToString(uuidBuffer));

    await this.registerDevice(uuid, deviceToken, language);
      
    return tokenDto;
  }

  async delete(userUuid: string): Promise<void> {
    await this.validateByUuid(userUuid);
    
    const uuidBuffer = stringToBuffer(userUuid);

    await this.prismaService.refresh.deleteMany({
      where: {
        userUuid: uuidBuffer,
      },
    });

    await this.prismaService.auth.delete({
      where: {
        uuid: uuidBuffer
      }
    });
  }

  async changeAccessToken(uuid: string, deviceToken: string, language: string): Promise<TokenDto> {
    if (!uuid) {
      throw new HttpException('존재하지 않는 유저 정보', 401);
    }

    const authDto = this.validateByUuid(uuid);
    if (!authDto) {
      throw new HttpException('가입되지 않은 회원', 401);
    }

    const tokenDto = await this.generateToken(uuid);

    await this.registerDevice(uuid, deviceToken, language);

    return tokenDto;
  }

  async generateToken(uuid: string): Promise<TokenDto> {
    const payload = { sub: uuid };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = this.jwtService.sign({}, { expiresIn: '180d' });

    const uuidBuffer = stringToBuffer(uuid);

    await this.prismaService.refresh.create({
      data: {
        userUuid: uuidBuffer,
        token: newRefreshToken,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken } as TokenDto;
  }

  async checkExpireToken(token: string): Promise<boolean> {
    try {
      this.jwtService.verify(token);

      return true;
    } catch (error) {
      return false;
    }
  }

  async requestGenerateToken(refreshToken: string): Promise<TokenDto> {
    const isValid = this.checkExpireToken(refreshToken);
    if (!isValid) {
      throw new HttpException('유효하지 않은 refresh token', 401);
    }

    let result: any;
    try {
      result = await this.prismaService.refresh.delete({
        where: {
          token: refreshToken
        }
      });
    } catch (error) {
      throw new HttpException('유효하지 않은 refresh token', 401);
    }

    const uuidBuffer = result.userUuid;
    const uuid = bufferToString(uuidBuffer);

    await this.validateByUuid(uuid);

    return await this.generateToken(uuid);

  }

  async getEmailProvider(uuidBuffer: Buffer): Promise<{ email: string, provider: string}> {
    return await this.prismaService.auth.findUnique({
      where: {
        uuid: uuidBuffer
      },
      select: {
        email: true,
        provider: true
      }
    });
  }

  async getUidEmail(userUuid: string) {
    const uuidBuffer = stringToBuffer(userUuid);
    const auth = await this.prismaService.auth.findUnique({
      where: { uuid: uuidBuffer }
    });
    
    if (!auth) {
      return { uid: 0, email: 'unknown' };
    }

    return { uid: auth.authId, email: auth.email, uuidBuffer };
  }
}

import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator';
import * as admin from 'firebase-admin';
import { SendFcmDto } from './dto/send-fcm.dto';
import { winstonLogger } from 'src/logger/winston-logger';
import { Device, Prisma } from '@prisma/client';
import { SendFcmsDto } from './dto/send-fcms.dto';
import { HttpException } from '@nestjs/common';
import { stringToBuffer } from 'src/utils/methods';

@Injectable()
export class FcmService {
  private readonly select: Prisma.DeviceSelect;
  constructor(private readonly prismaService: PrismaService) {
    this.select = {
      deviceId: true,
      deviceToken: true,
      createdAt: true
    };
  }

  initializeFirebaseAdmin() {
    if (!admin.apps.length) {
      const firebase_params = {
        type: process.env.FCM_TYPE,
        projectId: process.env.FCM_PROJECT_ID,
        privateKeyId: process.env.FCM_PRIVATE_KEY_ID,
        privateKey: process.env.FCM_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FCM_CLIENT_EMAIL,
        clientId: process.env.FCM_CLIENT_ID,
        authUri: process.env.FCM_AUTH_URI,
        tokenUri: process.env.FCM_TOKEN_URI,
        authProviderX509CertUrl: process.env.FCM_AUTH_PROVIDER_X509_CERT_URL,
        clientC509CertUrl: process.env.FCM_CLIENT_X509_CERT_URL
      };

      admin.initializeApp({
        credential: admin.credential.cert(firebase_params)
      });
    }
  }

  async registerDevice(uuid: string, deviceToken: string, language: string) {
    const uuidBuffer = stringToBuffer(uuid);

    const device = await this.prismaService.device.findUnique({
      where: {
        deviceToken
      }, 
      select: this.select
    });

    if (!device) {
      try {
        return await this.prismaService.device.create({
          data: {
            userUuid: uuidBuffer,
            deviceToken,
            language
          },
          select: this.select
        });
      } catch (error) {
        winstonLogger.error(`디바이스 중복 등록, error: ${error}`);
      }
    } else {
      if (device.language !== language || device.userUuid !== uuidBuffer) {
        return await this.prismaService.device.update({
          where: {
            deviceToken
          },
          data: {
            userUuid: uuidBuffer,
            language
          },
          select: this.select
        });
      }

      return device;
    }
  }

  async deleteDevice(deviceToken: string): Promise<void> {
    try {
      await this.prismaService.device.delete({
        where: {
          deviceToken
        }
      });
    } catch (error) {
      throw new HttpException('존재하지 않는 디바이스 토큰입니다.', 400);
    }
  }

  async send(sendFcmDto: SendFcmDto) {
    this.initializeFirebaseAdmin();

    const { token, title, message } = sendFcmDto;
    const payload = {
      token: token,
      notification: {
        title: title,
        body: message
      },
      data: {
        body: message
      }
    };
    let success = 0;
    let fail = 0;
    try {
      await admin.messaging().send(payload);
      success++;
    } catch (error) {
      winstonLogger.error(`fcm 전송 실패 error: ${error}`);
      fail++;
    }

    return { success, fail };
  }

  async sendAll(sendFcmsDto: SendFcmsDto) {
    this.initializeFirebaseAdmin();

    const { title, message, language } = sendFcmsDto;
    let success = 0;
    let fail = 0;
    const devices = await this.prismaService.device.findMany({ where: { language } });

    await Promise.all(devices.map(async (device: Device) => {
      const payload = {
        token: device.deviceToken,
        notification: {
          title: title,
          body: message
        },
        data: {
          body: message
        }
      };

      try {
        await admin.messaging().send(payload);
        success++;
      } catch (error) {
        winstonLogger.error(`fcm 전송 실패 deviceToken: ${device.deviceToken}, error: ${error}`);
        fail++;
      }
    }));

    return { success, fail };
  }


}

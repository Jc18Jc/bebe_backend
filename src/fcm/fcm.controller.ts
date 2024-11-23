import { Controller, Post, Body, Query, Delete, Res, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { FcmService } from './fcm.service';
import { SendFcmDto } from './dto/send-fcm.dto';
import { RetFcmDto } from './dto/ret-fcm.dto';
import { SendFcmsDto } from './dto/send-fcms.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Response } from 'express';
import { RetDeviceDto } from './dto/ret-device.dto';
import { Roles } from 'src/utils/setMeta';

@Controller('fcm')
@ApiTags('fcm controller api')
@ApiBearerAuth('JWT Auth')
export class FcmController {
  constructor(private readonly fcmService: FcmService) { }

  @Post('device')
  @ApiResponse({
    status: 201,
    type: RetDeviceDto
  })
  @ApiOperation({ summary: '디바이스 토큰 등록 API, 업데이트 전에 로그인 되어 있는 유저 or language를 강제로 바꿀 유저에게 사용하세요.' })
  @Roles('master')
  registerDevice(@CurrentUser() user: CurrentUserDto, @Body() createDeviceDto: CreateDeviceDto, @Query('language') language: string): Promise<RetDeviceDto> {
    return this.fcmService.registerDevice(user.uuid, createDeviceDto.deviceToken, language.slice(0, 2));
  }

  @Post()
  @ApiResponse({
    status: 201,
    type: RetFcmDto
  })
  @ApiOperation({ summary: 'FCM 단일 전송 API' })
  @Roles('master')
  send(@Body() sendFcmDto: SendFcmDto): Promise<RetFcmDto> {
    return this.fcmService.send(sendFcmDto);
  }

  @Post('all')
  @ApiResponse({
    status: 201,
    type: RetFcmDto
  })
  @ApiOperation({ summary: 'FCM 전체 전송 API' })
  @Roles('master')
  sendAll(@Body() sendFcmsDto: SendFcmsDto): Promise<RetFcmDto> {
    return this.fcmService.sendAll(sendFcmsDto);
  }

  @Delete(':deviceToken')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '디바이스 토큰 삭제 API' })
  async deleteDevice(@Res() res: Response, @Param('deviceToken') deviceToken: string): Promise<Response> {
    await this.fcmService.deleteDevice(deviceToken);

    return res.status(204).json({ message: "성공적으로 디바이스 토큰을 삭제했습니다." });
  }
}

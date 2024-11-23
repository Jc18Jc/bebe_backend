import { Controller, Get, Post, Body } from '@nestjs/common';
import { EventInviteService } from './invite-mapping.service';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetMappingEmailDtos } from './dto/ret-mapping-email.dtos';
import { RetIsRegisterDto } from './dto/ret-is-Register.dto';
import { RetEventInviteDto } from './dto/ret-invite-mapping.dto';
import { CreateEventInviteDto } from './dto/create-invite-mapping.dto';

@Controller('event-invite')
@ApiTags('event-invite controller api')
@ApiBearerAuth('JWT Auth')
export class EventInviteController {
  constructor(private readonly eventEnviteService: EventInviteService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: RetEventInviteDto
  })
  @ApiOperation({ summary: '초대 코드로 추천인 등록 API' })
  register(@CurrentUser() user: CurrentUserDto, @Body() createEventInviteDto: CreateEventInviteDto): Promise<RetEventInviteDto> {
    return this.eventEnviteService.register(user.uuid, createEventInviteDto);
  }

  @Get('/all')
  @ApiResponse({
    status: 200,
    type: RetMappingEmailDtos
  })
  @ApiOperation({ summary: '본인을 추천해준 이메일 리스트 API' })
  findAll(@CurrentUser() user: CurrentUserDto): Promise<RetMappingEmailDtos> {
    return this.eventEnviteService.findAll(user.uuid);
  }

  @Get('/is-register')
  @ApiResponse({
    status: 200,
    type: RetIsRegisterDto
  })
  @ApiOperation({ summary: '본인의 추천인 등록 여부 조회 API' })
  findOne(@CurrentUser() user: CurrentUserDto): Promise<RetIsRegisterDto> {
    return this.eventEnviteService.isRegister(user.uuid);
  }
}

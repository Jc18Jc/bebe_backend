import { Controller, Get, Post, Body, Param, Headers } from '@nestjs/common';
import { MissionService } from './mission.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetMissionDto } from './dto/ret-mission.dto';
import { RetMissionCountDto } from './dto/ret-mission-count.dto';
import { RetMissionsDto } from './dto/ret-mission.dtos';

@Controller('mission')
@ApiTags('mission controller api')
@ApiBearerAuth('JWT Auth')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post('/complete')
  @ApiResponse({
    status: 201,
    type: RetMissionDto
  })
  @ApiOperation({ summary: '미션 완료 API' })
  create(@CurrentUser() user: CurrentUserDto, @Body() createMissionDto: CreateMissionDto, @Headers('X-Timezone') timezone: string = 'Asia/Seoul'): Promise<RetMissionDto> {
    return this.missionService.create(user.uuid, createMissionDto, timezone);
  }

  @Get('/count')
  @ApiResponse({
    status: 200,
    type: RetMissionCountDto
  })
  @ApiOperation({ summary: '미션 카운트 API' })
  count(@CurrentUser() user: CurrentUserDto): Promise<RetMissionCountDto> {
    return this.missionService.count(user.uuid);
  }

  @Get(':date')
  @ApiResponse({
    status: 200,
    type: RetMissionsDto
  })
  @ApiOperation({ summary: '미션 조회 API' })
  findByDate(@CurrentUser() user: CurrentUserDto, @Param('date') date: string): Promise<RetMissionsDto> {
    return this.missionService.findByDate(user.uuid, date);
  }

}

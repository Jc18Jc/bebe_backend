import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Res } from '@nestjs/common';
import { UserbabyService } from './userbaby.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BabyDto } from 'src/baby/dto/baby.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { UserbabyDto } from './dto/userbaby.dto';

@ApiTags('userbaby controller api')
@Controller('userbaby')
@ApiBearerAuth('JWT Auth')
export class UserbabyController {
  constructor(private userBabyService: UserbabyService) { }

  @Post()
  @ApiResponse({
    status: 201,
    type: UserbabyDto
  })
  @ApiOperation({ summary: '유저-아이 연결 API' })
  async addUserBaby(@CurrentUser() user: CurrentUserDto, @Body() userBabyDto: UserbabyDto): Promise<UserbabyDto> {
    const result = await this.userBabyService.addBaby(user.uuid, userBabyDto.babyId, userBabyDto.role);
    const { userUuid, ...userbabyDto } = result;

    return userbabyDto;
  }

  @Delete(':babyId')
  @ApiResponse({
    status: 204,
  })
  @ApiOperation({ summary: '유저-아이 연결 해제 API, 유저의 아기 삭제' })
  async deleteUserBaby(@Param('babyId', ParseIntPipe) babyId: number, @CurrentUser() user: CurrentUserDto, @Res() res: Response): Promise<void> {
    await this.userBabyService.deleteBaby(user.uuid, babyId);

    res.status(204).json({ message: '성공적으로 유저에게서 아기 정보를 삭제했습니다.' });
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [BabyDto]
  })
  @ApiOperation({ summary: '유저의 아기 정보 조회 API' })
  hasBaby(@CurrentUser() user: CurrentUserDto): Promise<BabyDto[]> {
    return this.userBabyService.findBabyList(user.uuid);
  }
}

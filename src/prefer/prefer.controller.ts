import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Res } from '@nestjs/common';
import { PreferService } from './prefer.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PreferDto } from './dto/prefer.dto';
import { Response } from 'express';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@ApiTags('prefer controller api')
@ApiBearerAuth('JWT Auth')
@Controller('prefer')
export class PreferController {
  constructor(private readonly preferService: PreferService) { }

  @Get('/:babyId')
  @ApiResponse({
    status: 200,
    type: [PreferDto]
  })
  @ApiOperation({ summary: '음식 선호도 리스트 API' })
  findAll(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number): Promise<PreferDto[]> {
    return this.preferService.findAll(user.uuid, babyId);
  }

  @Post()
  @ApiResponse({
    status: 201,
    type: PreferDto
  })
  @ApiOperation({ summary: '음식 선호도 생성(수정) API' })
  create(@CurrentUser() user: CurrentUserDto, @Body() createPreferDto: PreferDto): Promise<PreferDto> {
    return this.preferService.create(user.uuid, createPreferDto);
  }

  @Delete('/:babyId')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '음식 선호도 삭제 API' })
  async remove(@CurrentUser() user: CurrentUserDto, @Res() res: Response, @Param('babyId', ParseIntPipe) babyId: number, @Query('foodId', ParseIntPipe) foodId: number): Promise<Response> {
    await this.preferService.remove(user.uuid, babyId, foodId);

    return res.status(204).json({ message: '성공적으로 음식 선호도를 제거했습니다.' });
  }
}

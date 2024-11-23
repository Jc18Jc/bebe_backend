import { Controller, Post, Body, Headers, Get, Query, ParseIntPipe } from '@nestjs/common';
import { SajuService } from './saju.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { RetSajuDto } from './dto/ret-saju.dto';
import { CreateSajuDto } from './dto/create-saju.dto';

@Controller('saju')
@ApiBearerAuth('JWT Auth')
@ApiTags('saju controller api')
export class SajuController {
  constructor(private readonly sajuService: SajuService) { }

  @Get()
  @ApiResponse({
    status: 200,
    type: RetSajuDto
  })
  @ApiOperation({ summary: '오늘의 사주 분석 결과 조회 API' })
  async getTodaySaju(@Query('type', ParseIntPipe) type: number, @CurrentUser() user: CurrentUserDto): Promise<RetSajuDto> {
    return this.sajuService.getTodaySaju(type, user.uuid);
  }

  @Post()
  @ApiResponse({
    status: 201,
    type: RetSajuDto
  })
  createGeneral(
    @Body() createDto: CreateSajuDto,
    @CurrentUser() user: CurrentUserDto,
    @Headers('X-Timezone') timezone: string = 'Asia/Seoul',
    @Headers('accept-language') language: string = 'ko',
    @Query('type', ParseIntPipe) type: number,
  ): Promise<RetSajuDto> {
    return this.sajuService.createGeneral(createDto, timezone, language.slice(0, 2), user.uuid, type);
  }
}

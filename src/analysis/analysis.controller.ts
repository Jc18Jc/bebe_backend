import { Controller, Post, Body, Headers } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalysisResultDto } from './dto/analysis-result.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { JsonValue } from '@prisma/client/runtime/library';

@ApiTags('analysis controller api')
@Controller('analysis')
@ApiBearerAuth('JWT Auth')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @Throttle({ default: { ttl: 86400000, limit: 5 } })
  @ApiResponse({
    status: 201,
    type: AnalysisResultDto
  })
  @ApiOperation({ summary: '결과 분석 API' })
  create(@CurrentUser() user: CurrentUserDto , @Body() createAnalysisDto: CreateAnalysisDto, @Headers('accept-language') language: string = 'ko'): Promise<AnalysisResultDto | JsonValue> {
    return this.analysisService.create(user.uuid, createAnalysisDto, language);
  }
}

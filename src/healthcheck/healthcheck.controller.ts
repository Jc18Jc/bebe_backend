import { Controller, Get } from '@nestjs/common';
import { HealthcheckService } from './healthcheck.service';
import { Public } from 'src/utils/setMeta';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VersionDto } from './dto/version.dto';
import { SkipThrottle } from '@nestjs/throttler';

@Public()
@Controller('healthcheck')
@SkipThrottle()
export class HealthcheckController {
  constructor(private readonly healthcheckService: HealthcheckService) { }

  @Get()
  @ApiOperation({ summary: '헬스 체크, 버전 체크 API' })
  @ApiResponse({
    status: 200,
    type: VersionDto
  })
  findAll(): VersionDto {
    return this.healthcheckService.findAll();
  }
}

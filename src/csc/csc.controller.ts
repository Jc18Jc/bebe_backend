import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, Res } from '@nestjs/common';
import { CscService } from './csc.service';
import { CreateCscDto } from './dto/create-csc.dto';
import { Public, Roles } from 'src/utils/setMeta';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CscDto } from './dto/csc.dto';
import { Response } from 'express';

@Controller('csc')
@ApiTags('csc controller api')
@ApiBearerAuth('JWT Auth')
export class CscController {
  constructor(private readonly cscService: CscService) { }

  @Post()
  @Public()
  @ApiResponse({
    status: 201,
    type: CscDto
  })
  @ApiOperation({ summary: '문의 메시지 생성 API' })
  create(@Body() createCscDto: CreateCscDto): Promise<CscDto> {
    return this.cscService.create(createCscDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [CscDto]
  })
  @ApiOperation({ summary: '문의 메시지 조회 API' })
  @Roles('master')
  findAll(): Promise<CscDto[]> {
    return this.cscService.findAll();
  }

  @Delete(':id')
  @ApiResponse({
    status: 200
  })
  @ApiOperation({ summary: '문의 메시지 isSolve false -> true' })
  @Roles('master')
  async update(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<Response> {
    await this.cscService.solve(id);

    return res.status(204).json({ message: "성공적으로 문의 메시지를 해결했습니다." });
  }
}

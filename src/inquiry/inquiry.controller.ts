import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Res } from '@nestjs/common';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetInquiryDto } from './dto/ret-inquiry.dto';
import { Response } from 'express';
import { ReplyUpdateInquiryDto } from './dto/reply-update-inquiry.dto';
import { Roles } from 'src/utils/setMeta';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@ApiTags('inquiry controller api')
@Controller('inquiry')
@ApiBearerAuth('JWT Auth')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) { }

  @Get('/admin')
  @ApiResponse({
    status: 200,
    type: [RetInquiryDto]
  })
  @ApiOperation({ summary: '관리자 전체 문의 조회 API' })
  @Roles('master')
  adminFindAll(): Promise<RetInquiryDto[]> {
    return this.inquiryService.adminFindAll();
  }

  @Post('/admin/reply')
  @ApiResponse({
    status: 200,
    type: RetInquiryDto 
  })
  @ApiOperation({ summary: '관리자 문의 답변 API' })
  @Roles('master')
  adminReply(@Body() replyUpdateInquiryDto: ReplyUpdateInquiryDto): Promise<RetInquiryDto> {
    return this.inquiryService.adminUpdateReply(replyUpdateInquiryDto);
  }

  @Get('/admin/:id')
  @ApiResponse({
    status: 200,
    type: RetInquiryDto
  })
  @ApiOperation({ summary: '관리자 단일 문의 조회 API' })
  @Roles('master')
  adminFindOne(@Param('id', ParseIntPipe) id: number): Promise<RetInquiryDto> {
    return this.inquiryService.adminFindOne(id);
  }
  
  @Post()
  @ApiResponse({
    status: 201,
    type: RetInquiryDto
  })
  @ApiOperation({ summary: '문의 등록 API' })
  create(@CurrentUser() user: CurrentUserDto, @Body() createInquiryDto: CreateInquiryDto): Promise<RetInquiryDto> {
    return this.inquiryService.create(user, createInquiryDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: [RetInquiryDto]
  })
  @ApiOperation({ summary: '개인 단위 문의 전체 조회 API' })
  findIndividualAll(@CurrentUser() user: CurrentUserDto): Promise<RetInquiryDto[]> {
    return this.inquiryService.findIndividualAll(user.uuid);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    type: RetInquiryDto
  })
  @ApiOperation({ summary: '단일 문의 조회 API' })
  findOne(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number): Promise<RetInquiryDto> {
    return this.inquiryService.findOne(user.uuid, id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: RetInquiryDto
  })
  @ApiOperation({ summary: '문의 수정 API' })
  update(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number, @Body() updateInquiryDto: UpdateInquiryDto): Promise<RetInquiryDto> {
    return this.inquiryService.update(user.uuid, id, updateInquiryDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '문의 삭제 API' })
  async remove(@Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<Response> {
    await this.inquiryService.remove(id);

    return res.status(204).json({ message: "성공적으로 문의 내역을 삭제했습니다." });
  }
}

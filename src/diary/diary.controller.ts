import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, ParseIntPipe, Res } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/upload/multerOptions';
import { RetDiaryDto } from './dto/ret-diary.dto';
import { Response } from 'express';
import { Roles } from 'src/utils/setMeta';

@Controller('diary')
@ApiTags('diary controller api')
@ApiBearerAuth('JWT Auth')
export class DiaryController {
  constructor(private readonly diaryService: DiaryService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: RetDiaryDto
  })
  @ApiOperation({ summary: '다이어리 생성 API' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  async create(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Body() createDiaryDto: CreateDiaryDto): Promise<RetDiaryDto> { 
    return this.diaryService.create(user.uuid, file, createDiaryDto);
  }

  @Get('user')
  @ApiResponse({
    status: 200,
    type: [RetDiaryDto]
  })
  @ApiOperation({ summary: '유저 기준 다이어리 조회 API, diary/user?baby-age=50(선택)&tag-names=첫외출,나들이(선택)' })
  findByUser(@CurrentUser() user: CurrentUserDto, @Query('tag-names') tagNames?: string, @Query('baby-age') babyAge?: string): Promise<RetDiaryDto[]> {
    return this.diaryService.findByUuid(user.uuid, tagNames, +babyAge);
  }

  @Get('baby/:babyId')
  @ApiResponse({
    status: 200,
    type: [RetDiaryDto]
  })
  @ApiOperation({ summary: '아기 기준 다이어리 조회 API, diary/baby/1?baby-age=50(선택)&tag-names=첫외출,나들이(선택)' })
  findByBabyId(@CurrentUser() user: CurrentUserDto, @Param('babyId', ParseIntPipe) babyId: number, @Query('tag-names') tagNames?: string, @Query('baby-age') babyAge?: string): Promise<RetDiaryDto[]> {
    return this.diaryService.findByBabyId(user.uuid, babyId, tagNames, +babyAge);
  }

  @Get('public')
  @ApiResponse({
    status: 200,
    type: [RetDiaryDto]
  })
  @ApiOperation({ summary: '공개 다이어리 조회 API, diary/public?page=1(필수)&baby-age=50(선택)&tag-names=첫외출,나들이(선택)' })
  findPublic(@Query('page', ParseIntPipe) page: number, @Query('baby-age') babyAge?: string, @Query('tag-names') tagNames?: string): Promise<RetDiaryDto[]> {
    const take = 50;
    const skip = (page - 1) * take;

    return this.diaryService.findPublicDiaries(skip, take, tagNames, +babyAge);
  }


  @Get(':id')
  @ApiResponse({
    status: 200,
    type: RetDiaryDto
  })
  @ApiOperation({ summary: '다이어리 단일 조회 API' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<RetDiaryDto> {
    return this.diaryService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: RetDiaryDto
  })
  @ApiOperation({ summary: '다이어리 수정 API, tag 변경 사항이 없어도 기존 데이터 전달해야함.' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  async update(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Param('id', ParseIntPipe) id: number, @Body() updateDiaryDto: UpdateDiaryDto): Promise<RetDiaryDto> {
    return this.diaryService.update(user.uuid, file, id, updateDiaryDto);
  }

  @Patch('register-public/:id')
  @ApiResponse({
    status: 200,
    type: RetDiaryDto
  })
  @ApiOperation({ summary: '관리자 검수 후 다이어리 공개 전환 API' })
  @Roles('master')
  registerPublic(@Param('id', ParseIntPipe) id: number): Promise<RetDiaryDto> {
    return this.diaryService.registerPublic(id);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '다이어리 삭제 API' })
  async remove(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<Response> {
    await this.diaryService.remove(user.uuid, id);

    return res.status(204).json({ message: "성공적으로 다이어리를 삭제했습니다." });

  }
}

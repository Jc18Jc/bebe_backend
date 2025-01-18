import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseIntPipe, Res } from '@nestjs/common';
import { BabyService } from './baby.service';
import { CreateBabyDto } from './dto/create-baby.dto';
import { UpdateBabyDto } from './dto/update-baby.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BabyDto } from './dto/baby.dto';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/upload/multerOptions';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@ApiTags('baby controller api')
@Controller('baby')
@ApiBearerAuth('JWT Auth')
export class BabyController {
  constructor(private readonly babyService: BabyService, private readonly userbabyService: UserbabyService) { }

  @Post()
  @ApiResponse({
    status: 201,
    type: BabyDto
  })
  @ApiOperation({ summary: '아기 생성 API' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  async create(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Body() createBabyDto: CreateBabyDto): Promise<BabyDto> {
    return await this.babyService.create(user.uuid, file, createBabyDto);
  }


  @Get(':id')
  @ApiResponse({
    status: 200,
    type: BabyDto
  })
  @ApiOperation({ summary: '아기 정보 조회 API' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.babyService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    type: BabyDto
  })
  @ApiOperation({ summary: '아기 정보 업데이트 API' })
  @UseInterceptors(FileInterceptor('imageFile', multerOptions))
  async update(@CurrentUser() user: CurrentUserDto, @UploadedFile('file') file: Express.Multer.File, @Param('id', ParseIntPipe) id: number, @Body() updateBabyDto: UpdateBabyDto): Promise<BabyDto> {    
    return await this.babyService.update(user.uuid, file, id, updateBabyDto);
  }

  @Delete(':id')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '아기 삭제 API' })
  async remove(@CurrentUser() user: CurrentUserDto, @Param('id', ParseIntPipe) id: number, @Res() res: Response): Promise<Response> {
    await this.userbabyService.deleteBaby(user.uuid, id);

    return res.status(204).json({ message: "성공적으로 아기 정보를 삭제했습니다." });
  }

}

import { Controller, Get, Body, Patch, Delete, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetUserDto } from './dto/ret-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@ApiTags('user controller api')
@ApiBearerAuth('JWT Auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @ApiResponse({
    status: 201,
    type: RetUserDto
  })
  @ApiOperation({ summary: '유저 생성 API' })
  async create(@Body() createUserDto: CreateUserDto, @CurrentUser() user: CurrentUserDto): Promise<RetUserDto> {
    return this.userService.create(createUserDto, user.uuid);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: RetUserDto
  })
  @ApiOperation({ summary: '유저 조회 API' })
  async findOne(@CurrentUser() user: CurrentUserDto): Promise<RetUserDto> {
    return this.userService.findOne(user.uuid);
  }

  @Patch()
  @ApiResponse({
    status: 200,
    type: RetUserDto
  })
  @ApiOperation({ summary: '유저 업데이트 API' })
  async update(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: CurrentUserDto) {
    return this.userService.update(user.uuid, updateUserDto);
  }

  @Delete()
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '유저 삭제 API' })
  async remove(@CurrentUser() user: CurrentUserDto, @Res() res: Response) {
    await this.userService.remove(user.uuid);

    return res.status(204).json({ message: '성공적으로 유저를 삭제했습니다.' });
  }

}

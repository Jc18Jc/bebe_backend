import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { UserContactService } from './user-contact.service';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RetUserContactDto } from './dto/ret-user-contact.dto';

@Controller('user-contact')
@ApiTags('user-contact controller api')
@ApiBearerAuth('JWT Auth')
export class UserContactController {
  constructor(private readonly userContactService: UserContactService) {}

  @Post()
  @ApiResponse({
    status: 201,
    type: RetUserContactDto
  })
  @ApiOperation({ summary: 'user contact, 초대 코드 생성 API' })
  create(@CurrentUser() user: CurrentUserDto, @Body() createUserContactDto: CreateUserContactDto): Promise<RetUserContactDto> {
    return this.userContactService.create(user.uuid, createUserContactDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    type: RetUserContactDto
  })
  @ApiOperation({ summary: '초대 코드 조회 API' })
  findOne(@CurrentUser() user: CurrentUserDto): Promise<RetUserContactDto> {
    return this.userContactService.findOne(user.uuid);
  }

  @Patch()
  @ApiResponse({
    status: 200,
    type: RetUserContactDto
  })
  @ApiOperation({ summary: '휴대폰 번호 수정 API' })
  update(@CurrentUser() user: CurrentUserDto, @Body() createUserContactDto: CreateUserContactDto): Promise<RetUserContactDto> {
    return this.userContactService.update(user.uuid, createUserContactDto);
  }
}

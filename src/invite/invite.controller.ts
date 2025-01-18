import { Controller, Get, Post, Param } from '@nestjs/common';
import { InviteService } from './invite.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BabyDto } from 'src/baby/dto/baby.dto';
import { InviteDto } from './dto/invite.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@ApiTags('invite controller api')
@ApiBearerAuth('JWT Auth')
@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) { }

  @Post(':babyId')
  @ApiResponse({
    status: 201,
    type: InviteDto
  })
  @ApiOperation({ summary: '초대 코드 생성 API' })
  create(@CurrentUser() user: CurrentUserDto, @Param('babyId') babyId: number): Promise<InviteDto> {
    return this.inviteService.create(user.uuid, babyId);
  }

  @Get(':inviteCode')
  @ApiResponse({
    status: 200,
    type: BabyDto
  })
  @ApiOperation({ summary: '초대 조회 API' })
  findOne(@Param('inviteCode') inviteCode: string): Promise<BabyDto> {
    return this.inviteService.findOne(inviteCode);
  }
}

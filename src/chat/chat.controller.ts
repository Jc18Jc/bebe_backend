import { Controller, Post, Body, Res, Get, ParseIntPipe, Param, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { RetMessageDtos } from './dto/ret-message.dto';
import { RetRoomDto, RetRoomDtos } from './dto/ret-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateChatDtoV2 } from './dto/create-chat-v2.dto';

@Controller('chat')
@ApiBearerAuth('JWT Auth')
@ApiTags('chat controller api')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post()
  @Throttle({ default: { ttl: 86400000, limit: 50 } })
  @ApiResponse({
    status: 201
  })
  @ApiOperation({ summary: '채팅 상담 API V1' })
  async create(@CurrentUser() user: CurrentUserDto, @Body() createChatDto: CreateChatDto, @Res() res: Response) {
    return await this.chatService.create(user.uuid, createChatDto, res, 'v1');
  }

  @Post('/v2')
  @Throttle({ default: { ttl: 86400000, limit: 50 } })
  @ApiResponse({
    status: 201
  })
  @ApiOperation({ summary: '채팅 상담 API V2' })
  async createChat(@CurrentUser() user: CurrentUserDto, @Body() createChatDto: CreateChatDtoV2, @Res() res: Response) {
    const { roomId, ...data } = createChatDto;

    return await this.chatService.create(user.uuid, data, res, 'v2', roomId);
  }

  @Post('/room')
  @ApiResponse({
    status: 201,
    type: RetRoomDto
  })
  @ApiOperation({ summary: '채팅 방 생성 API' })
  async createRoom(@CurrentUser() user: CurrentUserDto): Promise<RetRoomDto> {
    return await this.chatService.createRoom(user.uuid);
  }

  @Get('/rooms/:roomId')
  @ApiResponse({
    status: 200,
    type: RetMessageDtos
  })
  @ApiOperation({ summary: '채팅 내용 조회 API' })
  async getMessages(@Param('roomId', ParseIntPipe) roomId: number): Promise<RetMessageDtos> {
    return await this.chatService.getMessages(roomId);
  }

  @Get('/rooms')
  @ApiResponse({
    status: 200,
    type: RetRoomDtos
  })
  @ApiOperation({ summary: '채팅 방 조회 API' })
  async getRooms(@CurrentUser() user: CurrentUserDto): Promise<RetRoomDtos> {
    return await this.chatService.getRooms(user.uuid);
  }

  @Patch('/rooms/:roomId')
  @ApiResponse({
    status: 200,
    type: RetRoomDto
  })
  @ApiOperation({ summary: '채팅 방 수정 API' })
  async updateRoom(@Param('roomId', ParseIntPipe) roomId: number, @Body() updateRoomDto: UpdateRoomDto): Promise<RetRoomDto> {
    return await this.chatService.updateRoom(roomId, updateRoomDto);
  }
}

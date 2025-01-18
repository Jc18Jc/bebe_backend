import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DrawService } from './draw.service';
import { RetTicketDto } from './dto/ret-ticket.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';

@Controller('draw')
@ApiTags('draw controller api')
@ApiBearerAuth('JWT Auth')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Get('/ticket')
  @ApiResponse({
    status: 200,
    type: RetTicketDto
  })
  @ApiOperation({ summary: '티켓 개수 API' })
  async getTicket(@CurrentUser() user: CurrentUserDto): Promise<RetTicketDto> {
    return this.drawService.getTicket(user.uuid);
  }

  @Get('all')
  @ApiResponse({
    status: 200,
    type: RetTicketDto
  })
  @ApiOperation({ summary: '모든 티켓 개수 조회 API' })
  async getAllTicket(): Promise<RetTicketDto> {
    return this.drawService.getAllTicket();
  }
}

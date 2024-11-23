import { MissionService } from 'src/mission/mission.service';
import { Injectable } from '@nestjs/common';
import { RetTicketDto } from './dto/ret-ticket.dto';
import { EventInviteService } from 'src/event-Invite/invite-mapping.service';

@Injectable()
export class DrawService {
  constructor(private readonly eventInviteService: EventInviteService , private readonly missionService: MissionService) {}

  async getTicket(userUuid: string): Promise<RetTicketDto> {
    const missionTicket = (await this.missionService.count(userUuid)).count;
    const inviteTicket = (await this.eventInviteService.findAll(userUuid)).count*10;
    const { isRegister } = (await this.eventInviteService.isRegister(userUuid));
    let registerTicket = 0;
    if (isRegister) {
      registerTicket = 10;
    }

    return { count: missionTicket + inviteTicket + registerTicket };
  }

  async getAllTicket(): Promise<RetTicketDto> {
    const missionTicket = await this.missionService.countAll();
    const inviteTicket = (await this.eventInviteService.countAll())*20;

    return { count: missionTicket + inviteTicket };
  }
}

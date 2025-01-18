import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { winstonLogger } from 'src/logger/winston-logger';

@Injectable()
export class AlarmService {
  constructor(private readonly httpService: HttpService) { }

  async sendWebexMessage(text: string) {
    try {
      const webhookUrl = process.env.WEBHOOK_URL;
      const data = { text: text };
      const headers = { 'Content-Type': 'application/json' };

      await firstValueFrom(this.httpService.post(webhookUrl, data, { headers }));
    } catch (error) {
      winstonLogger.error('webhook error', error.message);
    }
  }
}

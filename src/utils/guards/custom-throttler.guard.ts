import { ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';
import { CustomThrottlerStorage } from '../custom-throttler-storage';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UuidThrottlerGuard extends ThrottlerGuard {
  constructor(
    options: ThrottlerModuleOptions,
    private customStorage: CustomThrottlerStorage,
    reflector: Reflector,
  ) {
    super(options, customStorage, reflector);
  }

  protected async getTracker(req: any): Promise<string> {
    const user = req.user || null;
    if (user?.roles?.includes('master')) {
      // role이 master라면 랜덤 난수를 리턴해서 제한에 안걸리도록 함
      return String(Math.round(Math.random() * 1e8));
    }
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    return user?.uuid || ip;
  }

  protected async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, 'custom');

    let { totalHits } = await this.customStorage.increment(key, ttl);

    if (totalHits > limit) {
      const message = `Throttler exceeded: User email: ${req.user.email}, Auth Id: ${req.user.id}, Path: ${req.url}`;
      throw new HttpException(message, 429);
    }

    const response = context.switchToHttp().getResponse();
    const originalJson = response.json;
    response.json = async (...args) => {
      const result = originalJson.apply(response, args);
      const statusCode = response.statusCode;

      if (statusCode > 450) {
        ({ totalHits } = await this.customStorage.decrement(key));
      }

      return result;
    };

    return true;
  }
}

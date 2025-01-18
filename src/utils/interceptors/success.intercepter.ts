import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { winstonLogger } from '../../logger/winston-logger';
import { maskEmail } from 'src/utils/methods';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  constructor() { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url, method } = request;
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    const user = request?.user;
    let logText = `ip = ${ip}, [${method}] path = ${url}`;
    if (user) {
      const maskedEmail = maskEmail(user?.email) || 'unknown';

      logText += `, USER EMAIL = ${maskedEmail}, AUTH ID = ${user?.id || 'unknown' }`;
    }

    winstonLogger.info(logText);

    return next.handle().pipe(
      map((data) => ({
        status: "success",
        data
      }))
    );
  }
}

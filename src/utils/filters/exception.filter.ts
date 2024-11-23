import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as Sentry from '@sentry/node';
import { winstonLogger } from 'src/logger/winston-logger';
import { maskEmail } from 'src/utils/methods';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor() { }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const ip = request.headers['x-forwarded-for'] || 'unknown';
    let status: number;

    let logMessage = 'Internal Server Error';
    let userMessage = '서버에 문제가 발생했습니다.';

    // HttpException 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      if (status === HttpStatus.NOT_FOUND) {
        winstonLogger.info('[not-found ip 수집] ' + ip);
        response.status(status).json({
          message: 'no message'
        });

        return;
      }

      userMessage = exception.message;
      if (exception.cause instanceof Error) {
        logMessage = exception.cause.message;
      } else {
        logMessage = exception.message;
      }

    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Prisma 예외 처리
      status = HttpStatus.BAD_REQUEST;
      logMessage = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      // UnauthrizedException 처리
      status = HttpStatus.UNAUTHORIZED;
      userMessage = '인증 정보가 유효하지 않습니다.';
      logMessage = 'Unauthorized';
    } else if (exception instanceof Error) {
      // 기타 Error 처리
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      logMessage = exception.message;
    } else {
      // unknown 예외 처리
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      logMessage = exception.toString();
    }

    if (process.env.NEST_ENV !== 'develop') {
      Sentry.captureException(exception);
    }

    const user = request?.user;
    const path = request?.url;
    const maskedEmail = maskEmail(user?.email) || 'unknown';

    winstonLogger.error(`ip: ${ip}, path: ${path}, status: ${status}, message: ${logMessage}, USER EMAIL = ${maskedEmail}, AUTH ID = ${user?.id || 'unknown'}`);
    response.status(status).json({
      status: "error",
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: userMessage
    });
  }
}

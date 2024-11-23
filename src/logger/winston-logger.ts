import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as appRoot from 'app-root-path';

const logDir = `${appRoot.path}/logs`;

const infoFilter = winston.format((info) => {
  return info.level === 'info' ? info : false;
});

const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});


const { combine, timestamp, printf, colorize } = winston.format;

// 로그 출력 포맷 정의
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const winstonLogger = winston.createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    // info 로그 파일 설정
    new winston.transports.DailyRotateFile({
      level: 'info',
      format: combine(infoFilter()),
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: '%DATE%.log',
      maxSize: '20m',
      maxFiles: '30d'
    }),
    // error 로그 파일 설정
    new winston.transports.DailyRotateFile({
      level: 'error',
      format: combine(errorFilter()),
      datePattern: 'YYYY-MM-DD',
      dirname: logDir,
      filename: '%DATE%.error.log',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// 개발 환경일 경우 콘솔 로그 추가
if (process.env.NEST_ENV !== 'production') {
  winstonLogger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp(),
      logFormat
    )
  }));
}

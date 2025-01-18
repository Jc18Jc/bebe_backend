import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function bufferToString(buffer: Buffer): string | undefined {
  if (!buffer) {
    return undefined;
  }
  const hex = buffer.toString('hex');

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32)
  ].join('-');
}

export function stringToBuffer(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, ''), 'hex');
}


export function getDefaultDate(timeZone: string): { y: number, m: number, d: number } {
  const now = dayjs()
    .tz(timeZone)
    .toDate();
  const y = now.getFullYear();
  const m = now.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
  const d = now.getDate();

  return { y, m, d };
}


export function getDayDates(timeZone: string, date: string = undefined, startDay: number = 0, endDay: number = 1): { startDate: Date, endDate: Date } {
  const endDate = dayjs(date)
    .tz(timeZone)
    .subtract(endDay, 'day')
    .endOf('day')
    .toDate();
  const startDate = dayjs(endDate)
    .tz(timeZone)
    .subtract(startDay, 'days')
    .startOf('day')
    .toDate(); // 1일 전의 시작 시간

  return { startDate, endDate };
}

export function getMonthDates(timeZone: string, year: number, month: number): { startDate: Date, endDate: Date } {
  const startDate = dayjs()
    .tz(timeZone)
    .year(year)
    .month(month - 1)
    .startOf('month')
    .toDate();
  const endDate = dayjs(startDate)
    .tz(timeZone)
    .endOf('month')
    .toDate();

  return { startDate, endDate };
}

export function getTimeWithTimezone(date: Date | string, timeZone: string, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).tz(timeZone).format(format);
}

export function getTimeStringWithTimezone(date: string, timeZone: string): Date {
  return dayjs(date).tz(timeZone).toDate();
}

export function getDiffDays(date: Date): number {
  return dayjs().diff(dayjs(date), 'day');
}

export function isSameDay(date1: Date, date2: Date, timeZone: string): boolean {
  return dayjs(date1).tz(timeZone).startOf('day').isSame(date2);
}

export function getDate(date: Date): dayjs.Dayjs {
  return dayjs(date);
}

export function getStartOfDay(date: Date, timeZone: string): dayjs.Dayjs {
  return dayjs(date).tz(timeZone).startOf('day');
}

// 7일 전 날짜 구하기
export function getWeekBefore7Dates(year: number, month: number, day: number): { [key: string]: number } {
  const result = {};

  // 윤년
  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  }

  // 각 달의 일 수
  const daysInMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  for (let i = 0; i < 7; i++) {
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    result[`${year}-${formattedMonth}-${formattedDay}`] = 0;

    day -= 1;

    if (day === 0) {
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      day = daysInMonth[month - 1];
    }
  }

  return result;
}

export function maskEmail (email: string): string | null {
  if (!email || !email.includes('@')) {
    return null;
  }

  const [id, domain] = email.split('@');
  const idLength = id.length;

  if (idLength <= 3) {
    return null;
  }

  if (idLength <= 6) {
    return `${id.slice(0, 3)}${'*'.repeat(idLength - 3)}@${domain}`;
  }

  const half = Math.floor(idLength / 2);

  return `${id.slice(0, half)}${'*'.repeat(idLength - half)}@${domain}`; 
}

type DtoMapping<T, U> = { [K in keyof U]: keyof T };

export function generateDto<T, U>(source: T, mapping: DtoMapping<T, U>): U {
  const dto = {} as U;

  for (const [dtoKey, sourceKey] of Object.entries(mapping) as [keyof U, keyof T][]) {
    // @ts-expect-error: TypeScript가 안전성을 완전히 확인하지 못하는 경우에 대한 예외 처리
    dto[dtoKey] = source[sourceKey];
  }

  return dto;
}

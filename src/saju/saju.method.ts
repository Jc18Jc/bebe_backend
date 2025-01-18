import { HttpException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { generateTraditionalSajuAnalysisUserText } from 'src/public/prompts/saju-prompt';
import { getTimeWithTimezone } from 'src/utils/methods';

const prestemFilePath = path.join(__dirname, 'prestem.json');
const exquisitenessFilePath = path.join(__dirname, 'exquisiteness.json');

let prestemCachedData: any = null;
let exquisitenessCachedData: any = null;

function getTimeStemBranch(ilgan: string, time: number): string {
  const siganList = {
    갑: "갑",
    을: "병",
    병: "무",
    정: "경",
    무: "임",
    기: "갑",
    경: "병",
    신: "무",
    임: "경",
    계: "임"
  };

  const tenStems = [
    "경",
    "신",
    "임",
    "계",
    "갑",
    "을",
    "병",
    "정",
    "무",
    "기"
  ];

  const earthlyBranches = [
    "자", // 23:00 ~ 01:00
    "축", // 01:00 ~ 03:00
    "인", // 03:00 ~ 05:00
    "묘", // 05:00 ~ 07:00
    "진", // 07:00 ~ 09:00
    "사", // 09:00 ~ 11:00
    "오", // 11:00 ~ 13:00
    "미", // 13:00 ~ 15:00
    "신", // 15:00 ~ 17:00
    "유", // 17:00 ~ 19:00
    "술", // 19:00 ~ 21:00
    "해" // 21:00 ~ 23:00
  ];

  const timeToEarthlyBranchIndex = (hour: number) => {
    if (hour >= 23 || hour < 1) return 0;

    return Math.floor((hour + 1) / 2) % 12;
  };

  const startSigan = siganList[ilgan];
  const startStemIndex = tenStems.indexOf(startSigan);

  const branchIndex = timeToEarthlyBranchIndex(time);
  const stemIndexShift = branchIndex % 10; 

  const finalStemIndex = (startStemIndex + stemIndexShift) % 10;

  return ` ${tenStems[finalStemIndex]}${earthlyBranches[branchIndex]}시`;
}

function getPrestem(key: string): string {
  if (!prestemCachedData) {
    const jsonData = fs.readFileSync(prestemFilePath, 'utf-8');
    prestemCachedData = JSON.parse(jsonData);
  }

  return prestemCachedData?.Prestem[key] || null;
}

function getExquisiteness(key: string): string {
  if (!exquisitenessCachedData) {
    const jsonData = fs.readFileSync(exquisitenessFilePath, 'utf-8');
    exquisitenessCachedData = JSON.parse(jsonData);
  }

  return exquisitenessCachedData?.Exquisiteness[key] || null;
}

export function getFullStemBranch(dateString: string, isKorean: boolean): string {
  let [year, month, day, hour, minute] = dateString.split("-").map(Number);
  const ymd = dateString.slice(0, 10);
  let pStem = getPrestem(ymd);
  if (!pStem) {
    throw new HttpException('유효하지 않는 연도 범위입니다.', 400);
  }

  try {
    const infoExqi = getExquisiteness(ymd);
    if (infoExqi) {
      const exHour = Number(infoExqi.slice(0, 2));
      const exMinute = Number(infoExqi.slice(3, 5));
      if (hour < exHour || (hour === exHour && minute <= exMinute)) {
        const newDay = Number(dateString.slice(8, 10)) - 1;
        const newYmd = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
        const newMonthStem = getPrestem(newYmd).slice(4, 7);
        pStem = pStem.slice(0, 4) + newMonthStem + pStem.slice(7, 11);
      }
    }
  } catch (error) {
    throw new HttpException('function getFullStemBranch 에러', 500, { cause: new Error(`function getExquisiteness 에러: ${error.message}`) });
  }
  if (isKorean && minute < 30) {
    hour = hour - 1 >= 0 ? hour - 1 : 23;
  }

  try {
    const timeStemBranch = getTimeStemBranch(pStem.slice(8, 9), hour);

    return pStem + timeStemBranch;
  } catch (error) {
    throw new HttpException('function getTimeStemBranch 에러', 500, { cause: new Error(`function getFullStemBranch, getTimeStemBranch 에러: ${error.message}`) });
  }
}


const cheongan = {
  갑: { 음양: "양", 오행: "목" },
  을: { 음양: "음", 오행: "목" },
  병: { 음양: "양", 오행: "화" },
  정: { 음양: "음", 오행: "화" },
  무: { 음양: "양", 오행: "토" },
  기: { 음양: "음", 오행: "토" },
  경: { 음양: "양", 오행: "금" },
  신: { 음양: "음", 오행: "금" },
  임: { 음양: "양", 오행: "수" },
  계: { 음양: "음", 오행: "수" }
};

const jiji = {
  자: { 음양: "음", 오행: "수" },
  축: { 음양: "음", 오행: "토" },
  인: { 음양: "양", 오행: "목" },
  묘: { 음양: "음", 오행: "목" },
  진: { 음양: "양", 오행: "토" },
  사: { 음양: "양", 오행: "화" },
  오: { 음양: "음", 오행: "화" },
  미: { 음양: "음", 오행: "토" },
  신: { 음양: "양", 오행: "금" },
  유: { 음양: "음", 오행: "금" },
  술: { 음양: "양", 오행: "토" },
  해: { 음양: "양", 오행: "수" }
};

export function getYinYangFiveElements(lunarAge: string): string {
  const parts = lunarAge.split(" ");
  const counts = {
    음양: { 음: 0, 양: 0 },
    오행: { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
  };
  let total = 0;

  parts.forEach((part) => {
    const char = part.charAt(0);
    const info = cheongan[char];
    if (info) {
      counts.음양[info.음양]++;
      counts.오행[info.오행]++;
      total++;
    }

    const jijiChar = part.charAt(1);
    const jijiInfo = jiji[jijiChar];
    if (jijiInfo) {
      counts.음양[jijiInfo.음양]++;
      counts.오행[jijiInfo.오행]++;
      total++;
    }
  });

  const calculatePercentage = (value: number) => {
    const percentage = (value / total) * 100;

    return Number(percentage.toFixed(1)) + "%";
  };

  const result = {
    음양: {
      음: calculatePercentage(counts.음양.음),
      양: calculatePercentage(counts.음양.양)
    },
    오행: {
      목: calculatePercentage(counts.오행.목),
      화: calculatePercentage(counts.오행.화),
      토: calculatePercentage(counts.오행.토),
      금: calculatePercentage(counts.오행.금),
      수: calculatePercentage(counts.오행.수)
    }
  };

  return JSON.stringify(result, null, 2);
}

type Stem = '갑' | '을' | '병' | '정' | '무' | '기' | '경' | '신' | '임' | '계';
type Branch = '자' | '축' | '인' | '묘' | '진' | '사' | '오' | '미' | '신' | '유' | '술' | '해';
type Element = '목' | '화' | '토' | '금' | '수';
type YinYang = '양' | '음';

interface ElementInfo {
  element: Element;
  yinYang: YinYang;
}

const stemInfo: Record<Stem, ElementInfo> = {
  '갑': { element: '목', yinYang: '양' },
  '을': { element: '목', yinYang: '음' },
  '병': { element: '화', yinYang: '양' },
  '정': { element: '화', yinYang: '음' },
  '무': { element: '토', yinYang: '양' },
  '기': { element: '토', yinYang: '음' },
  '경': { element: '금', yinYang: '양' },
  '신': { element: '금', yinYang: '음' },
  '임': { element: '수', yinYang: '양' },
  '계': { element: '수', yinYang: '음' }
};

const branchInfo: Record<Branch, ElementInfo> = {
  '자': { element: '수', yinYang: '음' },
  '축': { element: '토', yinYang: '음' },
  '인': { element: '목', yinYang: '양' },
  '묘': { element: '목', yinYang: '음' },
  '진': { element: '토', yinYang: '양' },
  '사': { element: '화', yinYang: '양' },
  '오': { element: '화', yinYang: '음' },
  '미': { element: '토', yinYang: '음' },
  '신': { element: '금', yinYang: '양' },
  '유': { element: '금', yinYang: '음' },
  '술': { element: '토', yinYang: '양' },
  '해': { element: '수', yinYang: '양' }
};

export function getStemAndBranchInfo(parts: string[]): string {
  const getInfo = (stemBranch: string) => {
    const stem = stemBranch[0] as Stem;
    const branch = stemBranch[1] as Branch;

    return `${stemBranch}: ${stemInfo[stem].yinYang} ${stemInfo[stem].element}, ${branchInfo[branch].yinYang} ${branchInfo[branch].element}`;
  };

  const result = {
    "stems_and_branches_info": {
      "년간지": getInfo(parts[0]),
      "월간지": getInfo(parts[1]),
      "일간지": getInfo(parts[2]),
      "시간지": getInfo(parts[3])
    }
  };

  return JSON.stringify(result);
}


export function generateTodayInfo(userTimezone: string, isKorean: boolean): string {
  const { yinYang, stems } = generateLunarYinYangStemsInfo(getTimeWithTimezone(undefined, userTimezone, 'YYYY-MM-DD-HH-mm'), isKorean);

  return `Today's Yin-Yang and Five Elements distribution: ${yinYang} \n` +
    `Today's Heavenly Stems and Earthly Branches info: ${stems}`;
}

export function generateParentInfo(parentBirthday: string, parentAgeInDays: number, parentGender: string, currentDate: string, isKorean: boolean): string {
  const { lunarAge, yinYang, stems } = generateLunarYinYangStemsInfo(parentBirthday, isKorean);

  return generateTraditionalSajuAnalysisUserText(parentBirthday, lunarAge, parentAgeInDays, yinYang, parentGender, currentDate, stems, "Parent's", true);
}

function generateLunarYinYangStemsInfo(birthday: string, isKorean: boolean): { lunarAge: string, yinYang: string, stems: string } {
  const lunarAge = getFullStemBranch(birthday, isKorean);
  const yinYang = getYinYangFiveElements(lunarAge);
  const stems = getStemAndBranchInfo(lunarAge.split(' '));

  return { lunarAge, yinYang, stems };
}

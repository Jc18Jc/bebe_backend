import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException, Injectable } from '@nestjs/common';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import { stringToBuffer } from 'src/utils/methods';
import { AlarmService } from 'src/utils/alarm/alarm.service';
import { Prisma } from '@prisma/client';
import { RetDiaryDto } from './dto/ret-diary.dto';
import saveFile from 'src/upload/upload-s3';
import deleteFile from 'src/upload/delete-s3';

const diaryPrefixUrl = process.env.DIARY_IMAGE_PREFIX_URL;

@Injectable()
export class DiaryService {
  private readonly select: Prisma.DiarySelect;
  constructor(private readonly prismaService: PrismaService, private readonly userbabyService: UserbabyService, private readonly alarmService: AlarmService) {
    this.select = {
      diaryId: true,
      babyId: true,
      diaryDate: true,
      babyAge: true,
      content: true,
      imageUrl: true,
      height: true,
      weight: true,
      createdAt: true,
      isPublic: true,
      isRealPublic: true,
      tags: {
        select: {
          tagName: true
        }
      }
    };
  }

  async create(userUuid: string, file: Express.Multer.File, createDiaryDto: CreateDiaryDto): Promise<RetDiaryDto> {
    const url = await saveFile(file, diaryPrefixUrl) as string;
    createDiaryDto.imageUrl = url;

    await this.userbabyService.userHasBaby(userUuid, createDiaryDto.babyId);
    const uuidBuffer = stringToBuffer(userUuid);

    const { tagNames, isPublic, ...data } = createDiaryDto;
    const stringToBoolean = String(isPublic) === 'true';

    const diaryId = (await this.prismaService.diary.create({
      data: {
        userUuid: uuidBuffer,
        ...data,
        isPublic: stringToBoolean
      }
    })).diaryId;

    await this.updateTags(diaryId, tagNames, []);

    // tags를 포함하기 위해 다시 조회
    return this.findOne(diaryId);
  }


  async findByBabyId(userUuid: string, babyId: number, tagNames: string, babyAge: number): Promise<RetDiaryDto[]> {
    await this.userbabyService.userHasBaby(userUuid, babyId);

    return this.findMany(tagNames, babyAge, null, babyId);
  }


  findByUuid(userUuid: string, tagNames: string, babyAge: number): Promise<RetDiaryDto[]> {
    const uuidBuffer = stringToBuffer(userUuid);

    return this.findMany(tagNames, babyAge, uuidBuffer, null);
  }


  findPublicDiaries(skip: number, take: number, tagNames: string, babyAge: number): Promise<RetDiaryDto[]> {
    const splitedTagNames = this.splitTagNames(tagNames);

    return this.prismaService.diary.findMany({
      where: {
        isRealPublic: true,
        isPublic: true,
        babyAge: babyAge || undefined,
        tags: splitedTagNames ? {
          some: {
            tagName: {
              in: splitedTagNames
            }
          }
        } : undefined
      },
      orderBy: [{ diaryDate: 'desc' }, { diaryId: 'desc' }],
      select: this.select,
      take,
      skip
    });
  }


  findOne(id: number): Promise<RetDiaryDto> {
    return this.prismaService.diary.findUnique({
      where: {
        diaryId: id
      },
      select: this.select
    });
  }

  findMany(tagNames: string, babyAge: number, uuidBuffer: Buffer, babyId: number) {
    const splitedTagNames = this.splitTagNames(tagNames);

    return this.prismaService.diary.findMany({
      where: {
        babyId: babyId || undefined,
        userUuid: uuidBuffer || undefined,
        babyAge: babyAge || undefined,
        tags: splitedTagNames ? {
          some: {
            tagName: {
              in: splitedTagNames
            }
          }
        } : undefined
      },
      select: this.select,
      orderBy: [{ diaryDate: 'desc' }, { diaryId: 'desc' }]
    });
  }

  async update(userUuid: string, file: Express.Multer.File ,id: number, updateDiaryDto: UpdateDiaryDto): Promise<RetDiaryDto> {
    const diary = await this.hasDiary(userUuid, id);

    const url = await saveFile(file, diaryPrefixUrl) as string;
    updateDiaryDto.imageUrl = url ? url : updateDiaryDto.imageUrl;

    if (url && diary?.imageUrl) {
      await deleteFile(diary.imageUrl);
    }
    
    const { tagNames, isPublic, ...data } = updateDiaryDto;
    const stringToBoolean = String(isPublic) === 'true';
    await this.prismaService.diary.update({
      where: {
        diaryId: id
      },
      data: {
        ...data,
        isPublic: stringToBoolean
      }
    });

    if (!diary.isPublic && stringToBoolean) {
      const text = `다이어리 공개 요청 \n diaryId = ${id}`;
      this.alarmService.sendWebexMessage(text);
    }

    await this.updateTags(id, tagNames, diary.tags);

    return this.findOne(id);
  }


  async remove(userUuid: string, id: number): Promise<void> {
    const diary = await this.hasDiary(userUuid, id);

    if (diary.imageUrl) {
      await deleteFile(diary.imageUrl);
    }

    await this.updateTags(id, [], diary.tags);

    this.prismaService.diary.delete({
      where: {
        diaryId: id
      }
    });
  }

  registerPublic(id: number): Promise<RetDiaryDto> {
    return this.prismaService.diary.update({
      where: {
        diaryId: id
      },
      data: {
        isRealPublic: true
      },
      select: this.select
    });
  }

  async updateTags(diaryId: number, tagNames: string[], existingTags: any[]): Promise<void> {
    const existingTagNames = existingTags.map(tag => tag.tagName);

    const tagsToDelete = existingTags.filter(tag => !tagNames.includes(tag.tagName));

    await this.prismaService.diaryTags.deleteMany({
      where: {
        diaryId,
        tagName: { in: tagsToDelete.map(tag => tag.tagName) }
      }
    });

    const tagsToCreate = tagNames.filter(tagName => !existingTagNames.includes(tagName));

    await this.prismaService.diaryTags.createMany({
      data: tagsToCreate.map(tagName => ({
        tagName,
        diaryId: diaryId
      }))
    });
  }


  splitTagNames(tagNames: string): string[] {
    if (!tagNames) {
      return null;
    }

    return tagNames.split(',');
  }


  async hasDiary(userUuid: string, diaryId: number): Promise<RetDiaryDto> {
    const diary = await this.findOne(diaryId);

    if (!diary) {
      throw new HttpException('해당 다이어리가 없습니다.', 400);
    }

    await this.userbabyService.userHasBaby(userUuid, diary.babyId);

    return diary;
  }
}

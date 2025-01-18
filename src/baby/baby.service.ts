import { Injectable } from '@nestjs/common';
import { CreateBabyDto } from './dto/create-baby.dto';
import { UpdateBabyDto } from './dto/update-baby.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Baby } from '@prisma/client';
import { UserbabyService } from 'src/userbaby/userbaby.service';
import saveFile from 'src/upload/upload-s3';
import deleteFile from 'src/upload/delete-s3';

const babyPrefixUrl = process.env.BABY_IMAGE_PREFIX_URL;

@Injectable()
export class BabyService {
  constructor(private prismaService: PrismaService, private readonly userbabyService: UserbabyService) { }

  async create(userUuid: string, file: Express.Multer.File, createBabyDto: CreateBabyDto): Promise<Baby> {
    const url = await saveFile(file, babyPrefixUrl) as string;
    createBabyDto.imageUrl = url;

    const { role, ...data } = createBabyDto;

    const baby = await this.prismaService.baby.create({
      data
    });
    
    await this.userbabyService.addBaby(userUuid, baby.babyId, role);

    await this.prismaService.record.create({
      data: {
        babyId: baby.babyId,
        type: 18,
        attribute: {
          weight: baby.weight,
          height: baby.height
        }
      }
    });

    return baby;
  }

  async findOne(id: number): Promise<Baby> {
    return await this.prismaService.baby.findUnique({
      where: {
        babyId: id
      }
    });
  }

  async update(userUuid:string, file: Express.Multer.File, id: number, updateBabyDto: UpdateBabyDto): Promise<Baby> {
    await this.userbabyService.userHasBaby(userUuid, id);

    const url = await saveFile(file, babyPrefixUrl) as string;
    updateBabyDto.imageUrl = url ? url : updateBabyDto.imageUrl;

    const baby = await this.prismaService.baby.findUnique({
      where: {
        babyId: id
      }
    });

    if (baby?.imageUrl && url) {
      deleteFile(baby.imageUrl);
    }

    await this.createMeasureRecord(id, updateBabyDto.weight, updateBabyDto.height, baby);

    const retBaby = await this.prismaService.baby.update({
      where: {
        babyId: id
      },
      data: updateBabyDto
    });

    return retBaby;

  }

  async createMeasureRecord(babyId: number, weight: number, height: number, baby: Baby): Promise<void> {
    if (weight && height) {
      if (baby.weight !== weight || baby.height !== height) {
        await this.prismaService.record.create({
          data: {
            babyId,
            type: 18,
            attribute: {
              weight,
              height
            }
          }
        });
      }
    } else if (weight && baby.weight !== weight) {
      await this.prismaService.record.create({
        data: {
          babyId,
          type: 18,
          attribute: {
            weight
          }
        }
      });
    } else if (height && baby.height !== height) {
      await this.prismaService.record.create({
        data: {
          babyId,
          type: 18,
          attribute: {
            height
          }
        }
      });
    }
  }

  async updateWithWeightHeight(id: number, originWeight: number, originHeight: number): Promise<Baby> {
    const weight = originWeight > 0 ? originWeight : undefined;
    const height = originHeight > 0 ? originHeight : undefined;

    return await this.prismaService.baby.update({
      where: {
        babyId: id
      },
      data: {
        weight,
        height
      }
    });
  }
}

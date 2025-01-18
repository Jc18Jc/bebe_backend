import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "./s3.client.config";
import { HttpException } from "@nestjs/common";
import * as sharp from 'sharp';

async function uploadFileToS3(buffer: Buffer, key: string): Promise<string> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    }
  });
  const data = await upload.done();

  return data.Location as string;
}

export default async function saveFile(file: Express.Multer.File, prefixUrl: string, isRecord: boolean = false): Promise<string | { originalFileUrl: string, resizedFileUrl: string }> {
  try {
    if (file) {
      const compressedBuffer = await sharp(file.buffer)
        .resize(1024, 1024, {
          fit: sharp.fit.inside,
          withoutEnlargement: true
        })
        .toFormat('webp')
        .toBuffer();

      const randNum = Math.round(Math.random() * 1e9);

      const postfixUrl = `${Date.now() + '-' + randNum}.webp`;
      const s3Key = `${prefixUrl}/${postfixUrl}`;
      const resizedFileUrl = await uploadFileToS3(compressedBuffer, s3Key);

      if (isRecord) {
        const originalCompressedBuffer = await sharp(file.buffer)
          .toFormat('webp')
          .toBuffer();

        const originalS3Key = `${prefixUrl}/original/${postfixUrl}`;
        const originalFileUrl = await uploadFileToS3(originalCompressedBuffer, originalS3Key);

        return { originalFileUrl, resizedFileUrl };
      }

      return resizedFileUrl;
    }

    return "";
  } catch (error) {
    throw new HttpException('파일 저장 중 에러', error?.status, { cause: new Error(`saveFile error, error = ${error.message}`) });
  }
}

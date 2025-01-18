import { HttpException } from "@nestjs/common";
import { s3Client } from "./s3.client.config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export default async function deleteFile(imageUrl: string) {
  const key = imageUrl.split(`.com/`)[1];

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
  } catch (error) {
    throw new HttpException('파일 삭제 중 에러', 500, { cause: new Error(`deleteFile error, error = ${error.message}`) });
  }
}

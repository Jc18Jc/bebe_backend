import { HttpException } from '@nestjs/common';
import * as multer from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: (_, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|Webp/;
    const extnameMatch = allowedTypes.test(extname(file.originalname).toLowerCase());
    const mimetypeMatch = allowedTypes.test(file.mimetype);

    if (extnameMatch && mimetypeMatch) {
      cb(null, true);
    } else {
      cb(new HttpException('이미지 파일만 허용됩니다', 400), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
  }
};

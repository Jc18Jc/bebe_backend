import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthcheckService {
  findAll() {
    const versionJson = {
      android_version: '1.0.9',
      apple_version: '1.1.4'
    };

    return versionJson;
  }
}

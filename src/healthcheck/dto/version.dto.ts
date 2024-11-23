import { ApiProperty } from "@nestjs/swagger";

export class VersionDto {
  @ApiProperty({ example: '1.0.5' })
  android_version: string;

  @ApiProperty({ example: '1.0.5' })
  apple_version: string;
}

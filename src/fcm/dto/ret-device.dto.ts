import { ApiProperty } from "@nestjs/swagger";

export class RetDeviceDto {
  @ApiProperty({ example: 1 })
  deviceId: number;

  @ApiProperty({ example: "ABC123" })
  deviceToken: string;

  @ApiProperty({ example: "2021-07-01T00:00:00" })
  createdAt: Date;
}

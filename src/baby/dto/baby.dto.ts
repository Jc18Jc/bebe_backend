import { ApiProperty } from "@nestjs/swagger";

export class BabyDto {
  @ApiProperty({ example: 1 })
  babyId: number;

  @ApiProperty({ example: "익명이" })
  babyName: string;

  @ApiProperty({ example: 1 })
  babySex: number;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  babyBirthday: Date;

  @ApiProperty({ example: 60.5 })
  height: number;

  @ApiProperty({ example: 60.5 })
  weight: number;

  @ApiProperty({ example: "www.naver.com" })
  imageUrl: string;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  createdAt: Date;

  @ApiProperty({ example: "고혈압" })
  description?: string;
}

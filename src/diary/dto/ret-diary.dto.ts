import { ApiProperty } from "@nestjs/swagger";

export class RetDiaryDto {
  @ApiProperty({ example: 1 })
  diaryId: number;

  @ApiProperty({ example: 1 })
  babyId: number;

  @ApiProperty({ example: '2021-01-01' })
  diaryDate: string;

  @ApiProperty({ example: 50 })
  babyAge: number;

  @ApiProperty({ example: 'content' })
  content: string;

  @ApiProperty({ example: 'http://asdf.jpg' })
  imageUrl: string;

  @ApiProperty({ example: [
    {
      "tagName": "태그1"
    },
    {
      "tagName": "태그2"
    }
  ] })
  tags: TagDto[];

  @ApiProperty({ example: 5.1 })
  height: number;

  @ApiProperty({ example: 5.1 })
  weight: number;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  createdAt: Date;

  @ApiProperty({ example: false })
  isPublic: boolean;

  @ApiProperty({ example: false })
  isRealPublic: boolean;
}

class TagDto {
  @ApiProperty({ example: 'tag' })
  tagName: string;
}

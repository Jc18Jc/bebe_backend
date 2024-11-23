import { ApiProperty } from "@nestjs/swagger";

export class GalleryPoopRecordDto {
  @ApiProperty({ example: 1 })
  recordId: number;

  @ApiProperty({ example: "" })
  imageUrl: string;
}

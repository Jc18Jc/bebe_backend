import { ApiProperty } from "@nestjs/swagger";

export class RetRoomDto {
  @ApiProperty({ example: 1 })
  roomId: number;

  @ApiProperty({ example: 'room title' })
  title: string;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  createdAt: Date;

  @ApiProperty({ example: "2024-07-31T11:05:22.286Z" })
  updatedAt: Date;
}

export class RetRoomDtos {
  @ApiProperty({ example: [ { id: 1, title: 'room title', createdAt: "2024-07-31T11:05:22.286Z", updatedAt: "2024-07-31T11:05:22.286Z" }] })
  rooms: RetRoomDto[];
}

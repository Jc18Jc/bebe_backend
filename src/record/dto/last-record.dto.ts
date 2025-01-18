import { ApiProperty } from "@nestjs/swagger";

export class LastRecordDto {
  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  foodTime: Date;

  @ApiProperty({ examples: [1, 2, 3] })
  foodType: number;

  @ApiProperty({ example: 1 })
  foodId: number;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  diaperTime: Date;

  @ApiProperty({ examples: [4, 5] })
  diaperType: number;

  @ApiProperty({ example: 1 })
  diaperId: number;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  sleepingTime: Date;

  @ApiProperty({ example: "밤잠" })
  sleepType: string;

  @ApiProperty({ example: 1 })
  sleepingId: number;

  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  temperatureTime: Date;

  @ApiProperty({ example: 36.5 })
  temperature: number;

  @ApiProperty({ example: 1 })
  temperatureId: number;

}

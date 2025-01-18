import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDiaryDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  babyId: number;

  @IsString()
  @ApiProperty({ example: "오늘은 뒤집기에 성공했다." })
  content: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 5.1 })
  height?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: 3.2 })
  weight?: number;

  @IsString()
  @ApiProperty({ example: "2024-01-01" })
  diaryDate: string;

  @IsNumber()
  @ApiProperty({ example: 50 })
  babyAge: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'false' })
  isPublic?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ example: ["뒤집기", "첫 외출"] })
  tagNames?: string[] = [];

  @IsString()
  @IsOptional()
  imageUrl?: string;

}

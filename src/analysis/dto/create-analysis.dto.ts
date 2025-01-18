import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString } from "class-validator";

export class CreateAnalysisDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  recordId: number;

  @IsArray()
  @IsOptional()
  @ApiProperty({ example: ["쌀", "소고기"] })
  meals?: string[];

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "변을 너무 자주 눠요." })
  question?: string;
}

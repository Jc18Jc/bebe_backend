import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class CreateReportDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  babyId: number;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1 })
  babyAgeInDays?: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsInt, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { CustomDateValidatePipe } from "src/utils/pipes/custom-date-validate-pipe";

export class CreateBabyDto {
  @IsString()
  @ApiProperty({ example: "김재철" })
  babyName: string;

  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  @ApiProperty({ example: 1, description: "min=0, max=2, default=2" })
  babySex?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @CustomDateValidatePipe(5, 1)
  @ApiProperty({ example: "2024-06-11 10:34:48.554" })
  babyBirthday?: Date;

  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  @ApiProperty({ example: 50.5 })
  height?: number;

  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  @ApiProperty({ example: 50.5 })
  weight?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "" })
  imageUrl?: string;

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  @ApiProperty({ example: 1 })
  role?: number;

  @IsString()
  @ApiProperty({ example: "고혈압" })
  @IsOptional()
  description?: string;
}

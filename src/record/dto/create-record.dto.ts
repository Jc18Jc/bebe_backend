import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate, IsInt, IsOptional, IsString, ValidateNested } from "class-validator";
import { CustomDateValidatePipe } from 'src/utils/pipes/custom-date-validate-pipe';

export class CreateRecordDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  type: number;

  @IsDate()
  @IsOptional()
  @CustomDateValidatePipe(5, 0)
  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  startTime?: Date;

  @IsDate()
  @IsOptional()
  @CustomDateValidatePipe(5, 0)
  @ApiProperty({ example: "2024-06-11T01:34:48.554Z" })
  endTime?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "memo" })
  memo?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  originalImageUrl?: string;

  @IsInt()
  @ApiProperty({ example: 1 })
  babyId: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: "{\"quantity\": \"20\" }" })
  attribute?: string;
}

export class CreateRecordDtos {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecordDto)
  @ApiProperty({ type: [CreateRecordDto] })
  records: CreateRecordDto[];
}

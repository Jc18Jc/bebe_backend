import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, Matches, IsNumber, IsOptional } from 'class-validator';

export class CreateSajuDto {
  @ApiProperty({ example: "2024-02-16-04-01" })
  @Matches(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD-HH-mm이어야 합니다.'
  })
  @IsOptional()
  babyBirthday?: string;

  @ApiProperty({ example: "male" })
  @IsEnum(['male', 'female'])
  @IsOptional()
  babyGender?: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @IsOptional()
  babyAgeInDays?: number;

  @ApiProperty({ example: "1992-07-16-03-31" })
  @Matches(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD-HH-mm이어야 합니다.'
  })
  @IsOptional()
  parentBirthday?: string;

  @ApiProperty({ example: "female" })
  @IsEnum(['male', 'female'])
  @IsOptional()
  parentGender?: string;

  @ApiProperty({ example: 120 })
  @IsNumber()
  @IsOptional()
  parentAgeInDays?: number;

  @ApiProperty({ example: "1992-07-16-03-31" })
  @Matches(/^\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/, {
    message: '날짜 형식은 YYYY-MM-DD-HH-mm이어야 합니다.'
  })
  @IsOptional()
  userBirthday?: string;
  
  @ApiProperty({ example: "female" })
  @IsEnum(['male', 'female'])
  @IsOptional()
  userGender?: string;
  
  @ApiProperty({ example: 120 })
  @IsNumber()
  @IsOptional()
  userAgeInDays?: number;
}

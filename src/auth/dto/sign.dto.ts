import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SignDto {
  @IsString()
  @ApiProperty({ example: "bebe@gmail.com" })
  email: string;

  @IsString()
  @ApiProperty({ example: "google" })
  provider: string;

  @IsString()
  @IsOptional()
  uuid?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "example key" })
  appKey?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "ABC123" })
  deviceToken?: string;
}

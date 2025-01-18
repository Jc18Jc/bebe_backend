import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GenerateTokenDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: "ABC123" })
  deviceToken?: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GenerateRefreshTokenDto {
  @IsString()
  @ApiProperty({ example: "ABA123saS" })
  refreshToken: string;

}

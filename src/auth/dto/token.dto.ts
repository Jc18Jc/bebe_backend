import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {
  @ApiProperty({ example: "ABA123saS" })
  accessToken?: string;

  @ApiProperty({ example: "ABA123saS" })
  refreshToken?: string;
}

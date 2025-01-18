import { ApiProperty } from "@nestjs/swagger";

export class OauthAccessDto {
  @ApiProperty({ example: "ABA123saS" })
  oauthToken: string;

  @ApiProperty({ example: "ABA123saS" })
  accessToken: string;
}

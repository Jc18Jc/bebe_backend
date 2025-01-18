import { ApiProperty } from "@nestjs/swagger";

export class AuthDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty()
  id: number;
}

import { ApiProperty } from "@nestjs/swagger";

export class RetUserContactDto {
  @ApiProperty({ example: '123456' })
  inviteCode: string;

  @ApiProperty({ example: '010-1234-5678' })
  phoneNumber: string;
}

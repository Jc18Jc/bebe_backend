import { ApiProperty } from "@nestjs/swagger";

export class RetEventInviteDto {
  @ApiProperty({ example: '김재철' })
  userName: string;
}

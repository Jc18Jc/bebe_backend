import { ApiProperty } from "@nestjs/swagger";

export class InviteDto {
  @ApiProperty()
  inviteCode: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateEventInviteDto {
  @IsString()
  @ApiProperty({ example: '123456' })
  inviteCode: string;
}

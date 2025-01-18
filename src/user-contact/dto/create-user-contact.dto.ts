import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserContactDto {
  @IsString()
  @ApiProperty({ example: '010-1234-5678' })
  phoneNumber: string;
}

import { ApiProperty } from "@nestjs/swagger";

export class RetIsRegisterDto {
  @ApiProperty({ example: true })
  isRegister: boolean;
}

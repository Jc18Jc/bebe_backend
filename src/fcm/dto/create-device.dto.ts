import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateDeviceDto {
  @IsString()
  @ApiProperty({ example: "ABC123" })
	deviceToken: string;
}

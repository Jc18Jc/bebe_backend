import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class UserbabyDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  babyId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  role: number;
}

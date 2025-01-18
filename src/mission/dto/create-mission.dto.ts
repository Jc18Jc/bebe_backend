import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class CreateMissionDto {
  @IsNumber()
  @ApiProperty({ example: 1 })
  type: number;
}

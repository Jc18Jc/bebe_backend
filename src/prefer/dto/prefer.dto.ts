import { ApiProperty } from "@nestjs/swagger";
import { IsInt, Max, Min } from "class-validator";

export class PreferDto {
  @IsInt()
  @ApiProperty({ example: 1 })
  babyId: number;

  @IsInt()
  @ApiProperty({ example: 1 })
  foodId: number;

  @IsInt()
  @Max(5)
  @Min(1)
  @ApiProperty({ example: 1, description: "max = 5, min = 1" })
  type: number;
}

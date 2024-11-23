import { ApiProperty } from "@nestjs/swagger";

export class MealsDto {
  @ApiProperty({ example: ['소고기', '자두', '쌀'] })
  meals: string[];
}

import { ApiProperty } from "@nestjs/swagger";

export class RetUserDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: "이찬호" })
  userName: string;
}

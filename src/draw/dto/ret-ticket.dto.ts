import { ApiProperty } from "@nestjs/swagger";

export class RetTicketDto {
  @ApiProperty({ example: 1 })
  count: number;
}

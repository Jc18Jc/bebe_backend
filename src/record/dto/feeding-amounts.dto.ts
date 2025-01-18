import { ApiProperty } from "@nestjs/swagger";

export class FeedingAmountsDto {
  @ApiProperty({
    example: {
      '2024-07-01': 100,
      '2024-07-02': 200,
      '2024-08-15': 300
    }
  })
  feedingAmounts: Record<string, number>;
}

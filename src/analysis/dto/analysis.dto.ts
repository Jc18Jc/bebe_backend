import { ApiProperty } from '@nestjs/swagger';

export class AnalysisDto {
  @ApiProperty()
  '색상 평가': string;

  @ApiProperty()
  '질감 평가': string;

  @ApiProperty()
  '특이사항': string;

  @ApiProperty()
  '종합 의견': string;
}

import { ApiProperty } from '@nestjs/swagger';

export class AnalysisResultDto {
  @ApiProperty({ example: 1 })
  recordId: number;

  @ApiProperty({
    example: '녹색은 모유 수유 아기에게 정상적일 수 있으나 붉은색은 혈액의 가능성이 있어 주의가 필요함'
  })
  color_evaluation: string;

  @ApiProperty({ example: '모유 수유 아기의 변으로서 정상 범주에 속함' })
  texture_evaluation: string;

  @ApiProperty({
    example: '붉은 반점은 혈액의 가능성이 있으며 소아과 의사의 진단이 필요함'
  })
  special_observations_evaluation: string;

  @ApiProperty({
    example:
      '아기의 변 색과 텍스처는 대부분 정상 범주에 속하지만 붉은 반점이 발견되었습니다. 이는 혈액일 가능성이 있으며, 특히 아기가 16일밖에 되지 않았기 때문에 소아과 의사의 즉각적인 진찰을 받는 것이 좋습니다. 아기의 건강을 위해 빠른 시일 내에 병원을 방문하십시오.'
  })
  comprehensive_assessment: string;

  constructor(partial: Partial<AnalysisResultDto> = {}) {
    Object.assign(this, partial);
  }
}

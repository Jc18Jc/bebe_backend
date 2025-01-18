import { IsInt, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRecordDto } from './create-record.dto';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 1 })
  type?: number;
}

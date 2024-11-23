import { ApiProperty } from "@nestjs/swagger";
import { RetMissionDto } from "./ret-mission.dto";

export class RetMissionsDto {
  @ApiProperty({ example: [{ completionDay: '2021-08-21', type: 1 }] })
  missions: RetMissionDto[];
}

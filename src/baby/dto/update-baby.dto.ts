import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateBabyDto } from "./create-baby.dto";

export class UpdateBabyDto extends PartialType(OmitType(CreateBabyDto, ['role'] as const),) {}

import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateRoomDto {
	@IsString()
	@ApiProperty({ example: 'room title' })
	@IsOptional()
	title?: string;
}

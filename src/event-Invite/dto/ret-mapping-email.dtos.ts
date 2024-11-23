import { ApiProperty } from "@nestjs/swagger";

export class RetMappingEmailDtos {
  @ApiProperty({ example: ['abc@naver.com', 'abc@gmail.com'] })
  emailList: string[];

  @ApiProperty({ example: 2 })
  count: number;
}

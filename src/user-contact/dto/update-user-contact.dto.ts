import { PartialType } from '@nestjs/swagger';
import { CreateUserContactDto } from './create-user-contact.dto';

export class UpdateUserContactDto extends PartialType(CreateUserContactDto) {}

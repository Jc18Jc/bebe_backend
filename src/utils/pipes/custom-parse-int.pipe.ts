import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  constructor(private defaultValue: number) { }

  transform(value: string, metadata: ArgumentMetadata): number {
    if (!value) {
      return this.defaultValue;
    }

    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new BadRequestException(`${metadata.data} must be a number`);
    }

    return parsedValue;
  }
}

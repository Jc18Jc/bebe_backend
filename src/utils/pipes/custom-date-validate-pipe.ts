import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator';

export function CustomDateValidatePipe(minYears: number, maxYears: number, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'dateValidatePipe',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!(value instanceof Date)) {
            return false;
          }
          const currentDate1 = new Date();
          const currentDate2 = new Date();

          const minDate = new Date(currentDate1.setFullYear(currentDate1.getFullYear() - minYears));
          const maxDate = new Date(currentDate2.setFullYear(currentDate2.getFullYear() + maxYears));
          maxDate.setDate(currentDate2.getDate() + 1);

          return value >= minDate && value <= maxDate;
        },
        defaultMessage(args: ValidationArguments) {
          return `Date must be between ${minYears} years ago and ${maxYears} years from now.`;
        }
      }
    });
  };
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request.user;
});

export class CurrentUserDto {
  email: string;

  provider: string;

  uuid: string;

  id: number;

  roles: string[];
}

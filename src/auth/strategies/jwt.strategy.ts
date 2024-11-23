import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { CurrentUserDto } from 'src/utils/decorators/user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  private adminUser: string;
  private adminPassword: string;
  private masterEmail:string;
  private masterProvider: string;
  private masterList: any;
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    });

    this.adminUser = process.env.ADMIN_USER;
    this.adminPassword = process.env.ADMIN_PASSWORD;
    this.masterEmail = process.env.MASTER_EMAIL;
    this.masterProvider = process.env.MASTER_PROVIDER;
    this.masterList = { [this.masterEmail]: this.masterProvider,[this.adminUser]: this.adminPassword };
  }

  // payload의 uuid를 조회해 user가 있는지 확인
  async validate(payload: any): Promise<CurrentUserDto> {
    const findUser = await this.authService.validateByUuid(payload.sub);
    const user = { ...findUser, roles: ['user'] };
    
    // 만약 유저의 이메일이 master email에 포함된다면 롤에 추가
    if (this.masterList[user?.email] === user?.provider) {
      user.roles.push('master');
    }

    return user;
  }
}

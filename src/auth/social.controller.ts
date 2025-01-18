import { Body, Controller, Delete, Headers, HttpException, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiExcludeController, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { Public } from 'src/utils/setMeta';
import { GoogleStrategy } from './strategies/google.strategy';
import * as jwt from 'jsonwebtoken';
import { AppleStrategy } from './strategies/apple.strategy';
import { Response } from 'express';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { SocialService } from './social.service';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { OauthAccessDto } from './dto/oauth-access.dto';
import { SignDto } from './dto/sign.dto';

@Controller('auth')
@ApiExcludeController()
export class SocialController {
  constructor(
    private readonly authService: AuthService,
    private readonly kakaoStrategy: KakaoStrategy,
    private readonly naverStrategy: NaverStrategy,
    private readonly googleStrategy: GoogleStrategy,
    private readonly appleWebStrategy: AppleStrategy,
    private readonly socialService: SocialService,
  ) { }

  private async handleSocialLogin(code: string, strategy: any, provider: string): Promise<OauthAccessDto> {
    if (!code) {
      throw new HttpException('로그인 코드 정보가 정확하지 않습니다.', 400);
    }

    const { oauthToken, idToken } = await strategy.getOauthToken(code);
    const profile = idToken ? jwt.decode(idToken) as { email?: string } : await strategy.getUserProfile(oauthToken);

    const email = profile?.email || profile?.kakao_account?.email;

    if (!email) {
      throw new HttpException('유저 정보가 불확실합니다.', 400);
    }

    const authDto = await this.authService.validateUser(email, provider);
    const tokenDto = authDto
      ? await this.authService.signIn(authDto.uuid)
      : await this.authService.signUp({ email, provider } as SignDto);

    return {
      oauthToken,
      accessToken: tokenDto.accessToken,
    };
  }


  /*
    #### 카카오 로그인 #### 
  */
  @Post('kakao/callback')
  @Public()
  @ApiResponse({
    status: 201,
    type: OauthAccessDto
  })
  @ApiOperation({ summary: '카카오 로그인 API' })
  kakaoCallback(@Body('code') code: string): Promise<OauthAccessDto> {
    return this.handleSocialLogin(code, this.kakaoStrategy, 'kakao');
  }

  /* 
    #### 애플 로그인 #### 
  */
  @Post('apple/callback')
  @Public()
  @ApiResponse({
    status: 201,
    type: OauthAccessDto
  })
  @ApiOperation({ summary: '애플 로그인 API' })
  appleWebCallback(@Body('code') code: string): Promise<OauthAccessDto> {
    return this.handleSocialLogin(code, this.appleWebStrategy, 'apple');
  }

  /*
    #### 네이버 로그인 #### 
  */
  @Post('naver/callback')
  @Public()
  @ApiResponse({
    status: 201,
    type: OauthAccessDto
  })
  @ApiOperation({ summary: '네이버 로그인 API' })
  naverCallback(@Body('code') code: string): Promise<OauthAccessDto> {
    return this.handleSocialLogin(code, this.naverStrategy, 'naver');
  }

  /*
    #### 구글 로그인 #### 
  */
  @Post('google/callback')
  @Public()
  @ApiResponse({
    status: 201,
    type: OauthAccessDto
  })
  @ApiOperation({ summary: '구글 로그인 API' })
  googleCallback(@Body('code') code: string): Promise<OauthAccessDto> {
    return this.handleSocialLogin(code, this.googleStrategy, 'google');
  }

  // 소셜 연결 해제
  @Delete()
  @ApiBearerAuth('JWT Auth')
  @ApiResponse({
    status: 204
  })
  @ApiOperation({ summary: '소셜 로그인 해제 API' })
  @UseGuards(JwtAuthGuard)
  async deleteAuth(@CurrentUser() user: CurrentUserDto, @Headers('Oauth-Token') oauthToken: string, @Res() res: Response): Promise<Response> {
    const { email, provider, uuid } = user;

    await this.socialService.delete(email, provider, uuid, oauthToken);

    return res.status(204).json({ message: '성공적으로 유저를 삭제했습니다.' });
  }
}

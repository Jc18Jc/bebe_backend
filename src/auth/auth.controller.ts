import { Controller, Post, Body, HttpException, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/utils/setMeta';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenDto } from './dto/token.dto';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { SignDto } from './dto/sign.dto';
import { CurrentUser, CurrentUserDto } from 'src/utils/decorators/user.decorator';
import { GenerateRefreshTokenDto } from './dto/generate-refresh-token.dto';

const originAppKey = process.env.APP_SIGNIN_SECRET_KEY;

@ApiTags('auth controller api')
@Controller()
@ApiBearerAuth('JWT Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign')
  @ApiResponse({
    status: 201,
    type: TokenDto
  })
  @ApiOperation({ summary: '유저 로그인 API' })
  @Public()
  async sign(@Body() signDto: SignDto, @Headers('accept-language') language: string = 'ko'): Promise<TokenDto> {
    const { email, provider, appKey, deviceToken } = signDto;

    if (appKey !== originAppKey) {
      throw new HttpException('요청의 출처가 올바르지 않습니다.', 400, { cause: new Error(`요청의 출처가 올바르지 않습니다. appKey=${appKey}`) });
    }

    if (!email || !provider) {
      throw new HttpException('email 혹은 provider가 없습니다.', 400);
    }
    const authDto = await this.authService.validateUser(email, provider);

    if (!authDto) { // 유저가 존재하지 않을 때 회원가입
      return this.authService.signUp({ email, provider }, language.slice(0, 2));
    } else {
      return this.authService.signIn(authDto.uuid, deviceToken, language.slice(0, 2));
    }
  }

  @Post('/generate/refresh')
  @ApiResponse({
    status: 201,
    type: TokenDto
  })
  @ApiOperation({ summary: 'refresh 이용 토큰 갱신 API' })
  @Public()
  changeRefreshToken(@Body() generateRefreshTokenDto: GenerateRefreshTokenDto): Promise<TokenDto> {
    const refreshToken = generateRefreshTokenDto?.refreshToken;
    if (!refreshToken) {
      throw new HttpException('refresh token이 존재하지 않습니다.', 401);
    }

    return this.authService.requestGenerateToken(refreshToken);
  }

  @Post('/generate/access')
  @ApiResponse({
    status: 201,
    type: TokenDto
  })
  @ApiOperation({ summary: 'access 이용 토큰 갱신 API' })
  async changeAccessToken(@CurrentUser() user: CurrentUserDto, @Body() generateTokenDto: GenerateTokenDto, @Headers('accept-language') language: string = 'ko'): Promise<TokenDto> {
    return this.authService.changeAccessToken(user.uuid, generateTokenDto.deviceToken, language.slice(0, 2));
  }

  @Post('/adminsign')
  @ApiResponse({
    status: 201,
    type: TokenDto
  })
  @ApiOperation({ summary: '관리자 페이지용 로그인 API' })
  @Public()
  async adminsign(@Body() signDto: SignDto): Promise<TokenDto> {
    const { email, provider } = signDto;
    if (!email || !provider) {
      throw new HttpException('email 혹은 provider가 없습니다.', 400);
    }
    const authDto = await this.authService.validateUser(email, provider);

    if (!authDto) {
      throw new HttpException('유저가 존재하지 않습니다.', 400);
    }

    return this.authService.generateToken(authDto.uuid);
  }
}

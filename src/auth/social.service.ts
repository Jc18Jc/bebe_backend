import { HttpException, Injectable } from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import * as jwt from 'jsonwebtoken';
import { AuthService } from "./auth.service";


const KAKAO_UNLINK_URL = 'https://kapi.kakao.com/v1/user/unlink';
const NAVER_UNLINK_URL = 'https://nid.naver.com/oauth2.0/token';
const APPLE_UNLINK_URL = 'https://appleid.apple.com/auth/revoke';
const GOOGLE_UNLINK_URL = 'https://accounts.google.com/o/oauth2/revoke';

const SUPPORTED_PROVIDERS = [
  'kakao',
  'naver',
  'apple',
  'google'
];

@Injectable()
export class SocialService {
  constructor(private readonly authService: AuthService) { }

  async delete(email: string, provider: string, uuid: string, oauthToken: string): Promise<void> {
    if (!(email && provider && uuid)) {
      throw new HttpException('가입되지 않은 사용자입니다.', 400);
    }
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      throw new HttpException('가입되지 않은 사용자입니다.', 400, { cause: new Error('존재하지 않는 provider') });
    }

    await this.authService.delete(uuid);

    return this.sendUnlinkRequest(provider, oauthToken);
  }

  private async sendUnlinkRequest(provider: string, oauthToken: string) {
    let response: any;
    try {
      response = await this.unlink(provider, oauthToken);
    } catch(error) {
      throw new HttpException('네트워크 오류로 회원 탈퇴 실패', 500, { cause: new Error(`회원 탈퇴 실패, error=${error.message}`), });
    }

    this.checkUnlickResponse(response);
  }


  private async unlink(provider: string, oauthToken: string): Promise<AxiosResponse> {
    switch (provider) {
      case 'kakao':
        return await axios.post(
          KAKAO_UNLINK_URL,
          {},
          {
            headers: {
              Authorization: `Bearer ${oauthToken}`
            }
          },
        );
      case 'naver':
        return await axios.post(NAVER_UNLINK_URL, null, {
          params: {
            grant_type: 'delete',
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            access_token: oauthToken,
            service_provider: 'NAVER'
          }
        });
      case 'apple':
        const client_secret = this.generateAppleClientSecret();

        return await axios.post(
          APPLE_UNLINK_URL,
          new URLSearchParams({
            token: oauthToken,
            client_id: process.env.APPLE_CLIENT_ID,
            client_secret,
            token_type_hint: 'access_token'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          },
        );
      case 'google':
        return await axios.post(GOOGLE_UNLINK_URL, null, {
          params: {
            token: oauthToken
          }
        });
    }
  }

  private checkUnlickResponse(response: AxiosResponse): void {
    if (response.status === 200) {
      return;
    }
    
    throw new HttpException(`소셜 연결 해제 실패`, response.status, { cause: new Error(`소셜 연결 해제 실패: ${response.data}`) });
  }


  private generateAppleClientSecret(): string {
    const privateKey = '-----BEGIN PRIVATE KEY-----\n' + process.env.APPLE_AUTH_KEY + '\n-----END PRIVATE KEY-----';
    const teamId = process.env.APPLE_TEAM_ID;
    const clientId = process.env.APPLE_CLIENT_ID;
    const keyId = process.env.APPLE_KEY_ID;

    return jwt.sign({}, privateKey, {
      algorithm: 'ES256',
      expiresIn: '1h',
      audience: 'https://appleid.apple.com',
      issuer: teamId,
      subject: clientId,
      keyid: keyId
    });
  }
}

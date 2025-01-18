import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'qs';

@Injectable()
export class KakaoStrategy {
  constructor() { }

  private clientID = process.env.KAKAO_CLIENT_ID;
  private redirectUri = process.env.KAKAO_CALLBACK_URL;

  async getOauthToken(code: string): Promise<string> {
    const tokenUrl = 'https://kauth.kakao.com/oauth/token';
    const data = qs.stringify({
      grant_type: 'authorization_code',
      client_id: this.clientID,
      redirect_uri: this.redirectUri,
      code
    });
    const headers = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
    };
    try {
      const response = await axios.post(tokenUrl, data, { headers });

      return response?.data?.access_token || null;
    } catch (error) {
      throw new HttpException('kakao 토큰 획득에 실패했습니다.', error.status, { cause: new Error(`Failed to get Kakao token: error = ${error.message}`) });

    }
  }

  async getUserProfile(oauthToken: string): Promise<any> {
    const profileUrl = 'https://kapi.kakao.com/v2/user/me';
    try {
      const response = await axios.get(profileUrl, {
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      });

      return response.data;
    } catch (error) {
      throw new HttpException('kakao 프로필 정보 조회 중 오류가 발생했습니다.', error.status, { cause: new Error(`Failed to get Kakao profile: error = ${error.message}`) });

    }
  }
}

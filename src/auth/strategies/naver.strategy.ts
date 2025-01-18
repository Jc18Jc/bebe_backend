import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NaverStrategy {
  private clientID = process.env.NAVER_CLIENT_ID;
  private clientSecret = process.env.NAVER_CLIENT_SECRET;
  private redirectUri = process.env.NAVER_CALLBACK_URL;

  async getOauthToken(code: string): Promise<string> {
    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';
    try {
      const response = await axios.post(tokenUrl, null, {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientID,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code
        }
      });

      return response.data.access_token;
    } catch (error) {
      throw new HttpException('naver 토큰 획득에 실패했습니다.', error.status, { cause: new Error(`Failed to get Naver token: error = ${error.message}`) });
    }
  }

  async getUserProfile(oauthToken: string): Promise<any> {
    const profileUrl = 'https://openapi.naver.com/v1/nid/me';
    try {
      const response = await axios.get(profileUrl, {
        headers: {
          Authorization: `Bearer ${oauthToken}`
        }
      });

      return response.data.response;
    } catch (error) {
      throw new HttpException('naver 프로필 정보 조회 중 오류가 발생했습니다.', error.status, { cause: new Error(`Failed to get Naver profile: error = ${error.message}`) });

      
    }
  }

}

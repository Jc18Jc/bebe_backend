import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleStrategy {
  constructor() { }

  private clientID = process.env.GOOGLE_CLIENT_ID;
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private redirectUri = process.env.GOOGLE_CALLBACK_URL;

  async getOauthToken(code: string): Promise<string> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    try {
      const response: any = await axios.post(tokenUrl, {
        grant_type: 'authorization_code',
        client_id: this.clientID,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code
      });

      return response.data.access_token;
    } catch (error) {
      throw new HttpException('google 토큰 획득에 실패했습니다.', error.status, { cause: new Error(`Failed to get Google token: error = ${error.message}`) });

    }
  }

  async getUserProfile(oauthToken: string): Promise<any> {
    const profileUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${oauthToken}`;
    try {
      const response = await axios.get(profileUrl);

      return response.data;
    } catch (error) {
      throw new HttpException('google 프로필 정보 조회 중 오류가 발생했습니다.', error.status, { cause: new Error(`Failed to get Google profile: error = ${error.message}`) });

    }
  }
}

import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as qs from 'querystring';

@Injectable()
export class AppleStrategy {
  constructor() { }
  private readonly clientId = process.env.APPLE_CLIENT_ID;
  private readonly teamId = process.env.APPLE_TEAM_ID;
  private readonly keyId = process.env.APPLE_KEY_ID;
  private readonly privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    process.env.APPLE_AUTH_KEY +
    '\n-----END PRIVATE KEY-----';
  private readonly redirectUri = process.env.APPLE_CALLBACK_URL;

  createSignWithAppleSecret(): string {
    const token = jwt.sign({}, this.privateKey, {
      algorithm: 'ES256',
      expiresIn: '1h',
      audience: 'https://appleid.apple.com',
      issuer: this.teamId,
      subject: this.clientId,
      keyid: this.keyId
    });

    return token;
  }

  async getOauthToken(code: string):  Promise<{"oauthToken": string, "idToken": string}> {
    const clientSecret = this.createSignWithAppleSecret();
    const params = {
      grant_type: 'authorization_code',
      code: code,
      client_secret: clientSecret,
      client_id: this.clientId,
      redirect_uri: this.redirectUri
    };

    try {
      const response = await axios.post(
        'https://appleid.apple.com/auth/token',
        qs.stringify(params),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        },
      );

      return { oauthToken: response.data?.access_token, idToken: response.data?.id_token };
    } catch (error) {
      throw new HttpException('apple 토큰 획득에 실패했습니다.', error.status, { cause: new Error(`Failed to get Apple token: error = ${error.message}`) });
    }
  }
}

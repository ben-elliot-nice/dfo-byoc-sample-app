import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/utils/result';

@Injectable()
export class ActionService {
  constructor(private http: HttpService, private jwtService: JwtService) {}

  async getValidToken(
    queryParams: { userId; brandId; token },
    cookieToken,
  ): Promise<Result<any, any>> {
    const { userId, brandId, token } = queryParams;
    const paramsCheck = userId && brandId && token;
    const cookieTokenValid = this.jwtService.decode(cookieToken);

    if (paramsCheck) {
      // check if params are good.
      const tokenVerificationResult = await this.verifyToken(
        brandId,
        userId,
        token,
      );
      if (tokenVerificationResult.isOk()) {
        return Result.ok(tokenVerificationResult.value['data']['accessToken']);
      }
    }

    // we now know params are no good - only remaining outcome is a valid cookie token
    if (cookieToken && cookieTokenValid) {
      return Result.ok(cookieToken);
    }

    return Result.error(
      'Token not verified with CXone and no valid token in cookie',
    );
  }

  isPossibleToAuthenticate(
    queryParams: { userId; brandId; token },
    accessCookie,
  ): Result<any, any> {
    const { userId, brandId, token } = queryParams;
    const paramsCheck = userId && brandId && token;
    const cookieToken = this.jwtService.decode(accessCookie);

    // no params and no cookie, jail
    if (!paramsCheck && !accessCookie) {
      return Result.error('No query params found and no cookie available');
    }

    // no params, cookie present, but cookie not valid
    if (!paramsCheck && accessCookie && !cookieToken) {
      return Result.error(
        'No query params found. Cookie found, but not a valid token.',
      );
    }

    return Result.ok(true);
  }

  async verifyToken(
    brandId: string,
    userId: string,
    token: string,
  ): Promise<Result<any, any>> {
    const url =
      'https://app-de-au1.niceincontact.com/dfo/3.0/one-time-token/verification';
    return await this.http.axiosRef
      .post(url, {
        brandId: Number(brandId),
        userId: Number(userId),
        purpose: 'channel-integration',
        token: token,
      })
      .then((result) => {
        return Result.ok(result);
      })
      .catch((error) => {
        return Result.error(error);
      });
  }

  async getChannelsList(token: string) {
    const url = 'https://app-de-au1.niceincontact.com/dfo/3.0/channels';
    return await this.http.axiosRef
      .get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((result) => {
        return Result.ok(result['data']);
      })
      .catch((error) => {
        return Result.error(error.response.data);
      });
  }
}

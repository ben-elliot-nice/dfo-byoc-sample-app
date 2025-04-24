import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { Cache } from 'cache-manager';
import { ActionService } from './action.service';
import { handleFailure } from './action.utils';

@Injectable()
export class ActionAuthenticatedMiddleware implements NestMiddleware {
  constructor(
    private actionService: ActionService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async handleSuccess(
    params: { newToken: boolean; token: string; message: string },
    req,
    res,
    next,
  ) {
    Logger.debug(params.message);
    Logger.debug(params.token);

    // Set the cookie if it's a newly issued token
    if (params.newToken) {
      const tokenDetails = this.jwtService.decode(params.token);
      const expiryIn =
        tokenDetails['exp'] - Number(Date.now().toString().slice(0, 10));
      const id = uuid();
      await this.cacheManager.set(id, params.token, expiryIn);
      res.cookie('dfoAccess', id, {
        maxAge: expiryIn * 1000,
        signed: true,
      });
    }

    req.byoc = { accessToken: params.token };
    return next();
  }

  async use(req: Request, res: Response, next: NextFunction) {
    Logger.debug('Running Action Auth Middleware');
    // Extract query params
    const { userId, brandId, token, backUrl } = req.query;

    // Get the token ID from the cookie.
    const tokenId = req.signedCookies['dfoAccess'];

    // Get the accessToken and check it's not expired.
    const accessToken = await this.cacheManager.get(tokenId);
    const tokenValid = this.jwtService.decode(accessToken);

    // Try to gather a redirectUrl for failure path
    const redirectUrl = backUrl
      ? backUrl
      : req.cookies['backUrl']
      ? req.cookies['backUrl']
      : false;

    // Fail fast in scenarios where we know we cannot authenticate the user.
    if (!(userId && brandId && token)) {
      if (!accessToken) {
        return handleFailure(
          'Cannot authenticate user. No params and no cookie present.',
          redirectUrl,
          res,
        );
      } else {
        if (!tokenValid) {
          return handleFailure(
            'Cannot authenticate user. No params and token invalid',
            redirectUrl,
            res,
          );
        }
      }
    }

    // Try to get the token from the params
    const paramTokenResult = await this.actionService.exchangeTokenWithCXone({
      userId,
      brandId,
      token,
    });
    if (paramTokenResult.isOk()) {
      return await this.handleSuccess(
        {
          message: 'Successfully got token from CXone.',
          newToken: true,
          token: paramTokenResult.value,
        },
        req,
        res,
        next,
      );
    }

    // Fail if token in cookies is also not valid.
    if (!tokenValid) {
      return handleFailure(
        'Cannot authenticate user. Params not valid nor token valid.',
        redirectUrl,
        res,
      );
    }

    // Cookie token valid and no other means for auth
    return await this.handleSuccess(
      {
        message: 'Valid token found in cookie.',
        newToken: false,
        token: accessToken,
      },
      req,
      res,
      next,
    );
  }
}

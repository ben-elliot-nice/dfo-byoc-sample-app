import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import OAuth2Server = require('oauth2-server');
import { ServerOptions } from 'oauth2-server';
import { oAuthServerModel } from './oauthServerModel.service';

@Injectable()
export class CallbackService {
  private oAuthServer: OAuth2Server;
  constructor(private oAuthModel: oAuthServerModel) {
    const options: ServerOptions = {
      model: this.oAuthModel,
    };
    this.oAuthServer = new OAuth2Server(options);
  }

  async getToken(request: Request) {
    request.headers['content-type'] = 'application/x-www-form-urlencoded';
    const oAuthReq: OAuth2Server.Request = new OAuth2Server.Request({
      method: request.method,
      query: request.query,
      headers: request.headers,
      body: request.body,
    });
    const oAuthRes: OAuth2Server.Response = new OAuth2Server.Response({
      headers: {},
      body: {},
    });
    return this.oAuthServer
      .token(oAuthReq, oAuthRes)
      .then((token) => {
        console.log(token);
        return {
          access_token: token.accessToken,
          expires_in: 30,
          token_type: 'Bearer',
          scope: token.scope,
        };
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async validateBearer(request: Request) {
    return this.oAuthServer.authenticate(
      new OAuth2Server.Request({
        method: request.method,
        query: request.query,
        headers: request.headers,
        body: request.body,
      }),
      new OAuth2Server.Response({
        headers: {},
        body: {},
      }),
    );
  }
}

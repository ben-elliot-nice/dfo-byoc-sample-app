import { Injectable } from '@nestjs/common';
import {
  Client,
  ClientCredentialsModel,
  Falsey,
  Token,
  User,
} from 'oauth2-server';

@Injectable()
export class oAuthServerModel implements ClientCredentialsModel {
  // NOTE: This is an in memory example of token management.
  // DO NOT USE THIS IN PRODUCTION
  private clients: Client[];
  private tokens: Token[];

  constructor() {
    this.clients = [
      {
        id: '2f52ebe1-45d0-4f36-a9d0-a94c788f53c6',
        secret: 'a2051bd7-462e-4817-a28e-bedfb570d739',
        redirectUris: 'http://localhost:3000',
        grants: ['client_credentials'],
        accessTokenLifetime: 30,
        refreshTokenLifetime: 30,
      },
    ];
    this.tokens = [];
  }

  async getClient(
    clientId: string,
    clientSecret: string,
  ): Promise<Client | Falsey> {
    const filteredClients = this.clients.filter((client) => {
      return client.id === clientId && client.secret === clientSecret;
    });

    return filteredClients.length ? filteredClients[0] : false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getUserFromClient(_client: Client): Promise<User | Falsey> {
    return {
      username: 'example',
    };
  }

  async saveToken(
    token: Token,
    client: Client,
    user: User,
  ): Promise<Falsey | Token> {
    const tokenResponse = {
      ...token,
      client: client,
      user: user,
    };
    tokenResponse.scope = 'admin';
    this.tokens.push(tokenResponse);
    return tokenResponse;
  }

  async getAccessToken(accessToken: string): Promise<Token | Falsey> {
    const filteredTokens = this.tokens.filter((token) => {
      return token.accessToken == accessToken;
    });

    return filteredTokens ? filteredTokens[0] : false;
  }

  async verifyScope(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: Token,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _scope: string | string[],
  ): Promise<boolean> {
    return true;
  }
}

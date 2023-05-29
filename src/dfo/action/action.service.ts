import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Result } from 'src/utils/result';
import { CreateChannelDto } from './create-channel.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ActionService {
  constructor(private http: HttpService) {}

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

  async createChannelInDFO(
    createChannelDto: CreateChannelDto,
    accessToken: string,
  ): Promise<Result<any, any>> {
    Logger.debug('Create Channel');

    const integrationId = '2807c78e-8622-41e9-8a96-e3013b0513eb';
    const channelId = uuid();

    const payload = {
      id: channelId,
      idOnExternalPlatform: channelId,
      channelIntegrationId: integrationId,
      ...createChannelDto,
    };

    Logger.debug(accessToken);

    Logger.debug(payload);

    const url = 'https://app-de-au1.niceincontact.com/dfo/3.0/channels';
    return await this.http.axiosRef
      .post(url, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        Logger.debug('Success');
        // Logger.debug(result);
        return Result.ok(result['data']);
      })
      .catch((error) => {
        Logger.debug('error');
        console.log(error);
        Logger.error(error);
        return Result.error(error);
      });
  }

  async removeChannelInDFO(channelId: string, accessToken: string) {
    Logger.debug('Remove Channel', channelId);

    const url = 'https://app-de-au1.niceincontact.com/dfo/3.0/channels';
    return await this.http.axiosRef
      .delete(url + '/' + channelId, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((result) => {
        Logger.debug('Success');
        // Logger.debug(result);
        return Result.ok(result['data']);
      })
      .catch((error) => {
        Logger.debug('error');
        console.log(error);
        Logger.error(error);
        return Result.error(error);
      });
  }

  async exchangeTokenWithCXone(params: {
    userId;
    brandId;
    token;
  }): Promise<Result<any, any>> {
    const { userId, brandId, token } = params;
    if (!(userId && brandId && token)) {
      return Result.error('Invalid Params. Expecting userId, brandId & token');
    }

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
        return Result.ok(result['data']['accessToken']);
      })
      .catch((error) => {
        return Result.error(error);
      });
  }
}

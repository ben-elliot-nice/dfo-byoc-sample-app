import {
  Body,
  CACHE_MANAGER,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Logger,
  Param,
  Post,
  Query,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ActionService } from './action.service';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';

@Controller('integration/action')
export class ActionController {
  constructor(
    private actionService: ActionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  getRedirectOrUnAuth(error, backUrl, request, response: Response) {
    // if params or cookie(valid or not), 403 back to acd
    Logger.debug(error);
    if (backUrl || request.cookies['backUrl']) {
      return response.redirect(
        302,
        backUrl ? backUrl : request.signedCookies['backUrl'],
      );
    } else {
      // any other problem gets a 401
      return response.status(HttpStatus.FORBIDDEN);
    }
  }

  @Get()
  @Render('index')
  async getAction(
    @Query() query,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    // This endpoint is called as a referral from ACD when a user tries to view details of the BYOC channel.
    // The implementations considers the following:
    // - users who are referred from ACD (validate token and render list)
    // - users who have visited from a shared link (refer back to backURL or otherwise 401)
    // - users who have bookmarked link (if cookie present and token active - render, otherwise refer back)
    // - users who visit link with no cookie and no query params (401)

    const { backUrl } = query;
    const accessCookie = request.signedCookies['dfoAccess'];

    console.log('query', query);

    const isPossibleToAuthenticate =
      this.actionService.isPossibleToAuthenticate(query, accessCookie);

    // check if no possible way to authenticate (no params, no cookie, not valid)
    if (isPossibleToAuthenticate.isError()) {
      return this.getRedirectOrUnAuth(
        isPossibleToAuthenticate.error,
        backUrl,
        request,
        response,
      );
    }

    // Get a valid token if possible.
    const isValidToken = await this.actionService.getValidToken(
      query,
      accessCookie,
    );

    console.log('should show before exception')

    // Return redirect/error if no valid token found
    if (isValidToken.isError()) {
      if (backUrl) {
        response.cookie('backUrl', backUrl);
      }
      return this.getRedirectOrUnAuth(
        isValidToken.error,
        backUrl,
        request,
        response,
      );
    }

    console.log('should not show')

    const validToken = isValidToken.value;
    const id = uuid();
    this.cacheManager.set(id, validToken, 1800);
    response.cookie('dfoAccess', id, {
      maxAge: 1800000,
      signed: true,
    });

    // Get channel data from CXone
    const channelsList = await this.actionService.getChannelsList(validToken);

    if (channelsList.isError()) {
      return this.getRedirectOrUnAuth(
        channelsList.error,
        backUrl,
        request,
        response,
      );
    }

    const filteredChannels = channelsList.value.filter(
      (channel) =>
        channel.channelIntegrationId == '2807c78e-8622-41e9-8a96-e3013b0513eb',
    );

    console.log(filteredChannels);

    // - Render the list of configured channels to the user
    return {
      channels: filteredChannels,
    };
  }

  @Get('create')
  newChannelForm() {
    // This controller would need to be used to render the form to users to submit the required details for the new channel DFO API.
    return 'new channel form';
  }

  @Post('create')
  createChannel(
    @Body()
    createChannelDto: {
      id: string;
      idOnExternalPlatform: string;
      channelIntegrationId: string;
      realExternalPlatformId: string;
      name: string;
      isPrivate: boolean;
      hasTreeStructure: boolean;
    },
  ) {
    // This controller would need to be used to accept the form and submit the required details for a new channel to the corresponding DFO API.
    console.log(createChannelDto);
  }

  @Get(':id')
  getChannelDetails(@Param('id') id) {
    // This controller would be used to display the channel details of a specific channel.
    console.log(id);
  }

  @Delete('deleteChannel/:id')
  deleteChannel(@Param('id') id) {
    // This controller is not 100% necessary unless you want admin's to be able to remove channels.
    // Implementation of this route is up to the brand.
    console.log(id);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  Res,
  ValidationPipe,
} from '@nestjs/common';
import { ActionService } from './action.service';
import { Request, Response } from 'express';
import { handleFailure } from './action.utils';
import { CreateChannelDto } from './create-channel.dto';

@Controller('integration/action')
export class ActionController {
  constructor(private actionService: ActionService) {}

  @Get()
  async getAction(@Req() request: Request, @Res() response: Response) {
    // Get token from auth middleware
    const validToken = request['byoc'].accessToken;

    // Try to gather a redirectUrl for failure path
    const { backUrl } = request.query;
    const redirectUrl = backUrl
      ? backUrl
      : request.cookies['backUrl']
      ? request.cookies['backUrl']
      : false;

    // Get channel data from CXone
    const channelsList = await this.actionService.getChannelsList(validToken);

    if (channelsList.isError()) {
      return handleFailure(
        'Did not recieve a successful result from channels API. Likely auth problem.',
        redirectUrl,
        response,
      );
    }

    const filteredChannels = channelsList.value.filter(
      (channel) =>
        channel.channelIntegrationId == '2807c78e-8622-41e9-8a96-e3013b0513eb',
    );

    // - Render the list of configured channels to the user
    return response.render('index', {
      channels: filteredChannels,
    });
  }

  @Get('create')
  @Render('createForm')
  newChannelForm() {
    console.log('Rendering form for creation');
    // This controller would need to be used to render the form to users to submit the required details for the new channel DFO API.
    return {};
  }

  @Post('create')
  async createChannel(
    @Body(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    createChannelDto: CreateChannelDto,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    // This controller would need to be used to accept the form and submit the required details for a new channel to the corresponding DFO API.
    console.log(createChannelDto);

    const validToken = request['byoc'].accessToken;

    const createChannelResult = await this.actionService.createChannelInDFO(
      createChannelDto,
      validToken,
    );

    if (createChannelResult.isError()) {
      return response.render('error', { message: 'Failed to create channel.' });
    } else {
      return response.redirect('/integration/action');
    }
  }

  @Get(':id')
  getChannelDetails(@Param('id') id) {
    // This controller would be used to display the channel details of a specific channel.
    console.log(id);
  }

  @Post('deleteChannel/:id')
  async deleteChannel(@Req() request: Request, @Res() response: Response) {
    // This controller is not 100% necessary unless you want admin's to be able to remove channels.
    // Implementation of this route is up to the brand.
    const id = request.params['id'] as string;

    console.log(id);

    const validToken = request['byoc'].accessToken;

    const deleteChannelResult = await this.actionService.removeChannelInDFO(
      id,
      validToken,
    );

    if (deleteChannelResult.isError()) {
      return response.render('error', { message: 'Failed to remove channel.' });
    } else {
      return response.redirect('/integration/action');
    }
  }
}

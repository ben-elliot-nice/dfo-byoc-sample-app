import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';

@Controller('integration/action')
export class ActionController {
  @Get()
  getAction(@Query() query) {
    // This endpoint is accessed by Admins.
    // The page is accessed by being redirected from the DFO paltform once a user clicks the integration and configures a channel
    // In a production implementation the middleware would either have its own list of channels or use the DFO endpoint to retrieve the configured channels
    //
    // High level steps:
    // - Take the contents from the query parameters
    // - Query the DFO API (one-time-token/verification) to validate access to page
    // - Retrieve the list of configured channels (either from DB or from DFO)
    // - Render the list of configured channels to the user
    console.log(query);
    return 'success';
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

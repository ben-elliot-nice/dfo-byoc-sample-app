import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateIntegrationRequest,
  CreateIntegrationResponse,
  GetIntegrationResponse,
  GetIntegrationsResponse,
  RegenerateClientAuthResponse,
  UpdateIntegrationRequest,
} from './integration.dto';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { IntegrationService } from './integration.service';
import { Request } from 'express';
import { User } from '../user/user.entity';
import { IntegrationGuard } from './integration.guard';

@Controller('/api/v1/integration')
export class IntegrationController {
  @Inject(IntegrationService)
  private readonly integrationService: IntegrationService;

  @Post()
  @UseGuards(JwtAuthGuard)
  async createIntegration(
    @Req() { user }: Request,
    @Body() body: CreateIntegrationRequest,
  ): Promise<CreateIntegrationResponse> {
    const integration = await this.integrationService.create(body, <User>user);
    return new CreateIntegrationResponse(integration);
  }

  @Get('')
  @UseGuards(JwtAuthGuard, IntegrationGuard)
  async listIntegrations(
    @Req() { user }: Request,
  ): Promise<GetIntegrationResponse[]> {
    const integration = await this.integrationService.list(<User>user);
    return GetIntegrationsResponse(integration);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IntegrationGuard)
  async getIntegration(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<GetIntegrationResponse> {
    const integration = await this.integrationService.get(id);
    return new GetIntegrationResponse(integration);
  }

  @Get(':id/regenerateOauthClient')
  @UseGuards(JwtAuthGuard, IntegrationGuard)
  async regenerateOAuthClient(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RegenerateClientAuthResponse> {
    const client = await this.integrationService.regenerate(id);
    return new RegenerateClientAuthResponse(client);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, IntegrationGuard)
  async updateIntegration(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateIntegrationRequest,
  ): Promise<GetIntegrationResponse> {
    const client = await this.integrationService.update(id, body);
    return new GetIntegrationResponse(client);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, IntegrationGuard)
  async removeIntegration(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.integrationService.delete(id);
  }
}

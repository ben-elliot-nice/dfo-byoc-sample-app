import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { Repository } from 'typeorm';
import {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
} from './integration.dto';
import { User } from '../user/user.entity';
import { IntegrationAlreadyExistsException } from './exceptions';
import { OauthService } from './oauth/oauth.service';
import { IntegrationNotFoundException } from './exceptions/integration-not-found.exception';
import { OAuthClient } from './oauth/oauth-client.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class IntegrationService {
  @InjectRepository(Integration)
  private readonly integrationRepository: Repository<Integration>;

  @Inject(OauthService)
  private readonly oauthService: OauthService;

  @Inject(UserService)
  private readonly userService: UserService;

  public async create(
    body: CreateIntegrationRequest,
    user: User,
  ): Promise<Integration> {
    const { integrationId, cxoneClientId, cxoneClientSecret } = body;
    let integration: Integration;

    if (integrationId) {
      integration = await this.integrationRepository.findOne({
        where: { integrationId },
      });

      if (integration) {
        throw new IntegrationAlreadyExistsException(
          `Cannot create another integration with id '${integrationId}'. Already exists.`,
        );
      }
    }

    integration = new Integration();
    integration.user = user;
    integration.cxoneClientId = cxoneClientId;
    integration.cxoneClientSecret = cxoneClientSecret;
    const secret = this.oauthService.generateClientSecret();
    const client = await this.oauthService.create(secret);
    integration.oauthClient = client;

    if (integrationId) {
      integration.integrationId = integrationId;
    }

    await this.integrationRepository.save(integration);

    console.log('integration: ', integration);
    integration.oauthClient.clientSecret = secret;

    return integration;
  }

  public async get(id: string): Promise<Integration> {
    // Get an existing integration
    const integration: Integration = await this.integrationRepository.findOne({
      where: { id },
      relations: {
        oauthClient: true,
        user: true,
      },
    });

    if (!integration) {
      throw new IntegrationNotFoundException(
        `Cannot find integration with uuid: ${id}`,
      );
    }

    return integration;
  }

  public async regenerate(id: string): Promise<OAuthClient> {
    const integration: Integration = await this.integrationRepository.findOne({
      where: { id },
      relations: {
        oauthClient: true,
      },
    });

    if (!integration) {
      throw new IntegrationNotFoundException(
        `Cannot find integration with uuid: ${id}`,
      );
    }

    const removeClientId = integration.oauthClient.id;

    // generate a new client
    const secret = this.oauthService.generateClientSecret();
    const client = await this.oauthService.create(secret);
    integration.oauthClient = client;
    await this.integrationRepository.save(integration);
    client.clientSecret = secret;

    // delete the old client
    await this.oauthService.remove(removeClientId);

    return client;
  }

  public async update(
    id: string,
    dto: UpdateIntegrationRequest,
  ): Promise<Integration> {
    const integration: Integration = await this.integrationRepository.findOne({
      where: { id },
      relations: {
        oauthClient: true,
      },
    });

    if (!integration) {
      throw new IntegrationNotFoundException(
        `Cannot find integration with uuid: ${id}`,
      );
    }

    if (dto.cxoneClientId) {
      integration.cxoneClientId = dto.cxoneClientId;
    }
    if (dto.cxoneClientSecret) {
      integration.cxoneClientSecret = dto.cxoneClientSecret;
    }
    if (dto.integrationId) {
      integration.integrationId = dto.integrationId;
    }

    await this.integrationRepository.save(integration);
    return integration;
  }

  public async delete(id: string) {
    const integration: Integration = await this.integrationRepository.findOne({
      where: { id },
      relations: {
        oauthClient: true,
      },
    });

    if (!integration) {
      throw new IntegrationNotFoundException(
        `Cannot find integration with uuid: ${id}`,
      );
    }

    await this.integrationRepository.remove(integration);
  }

  public async list(user: User): Promise<Integration[]> {
    console.log(user);
    const userEntity = await this.userService.get(user.id);
    const integrations: Integration[] = userEntity.integrations;
    return integrations;
  }
}

import { IsOptional, IsString } from 'class-validator';
import { Integration } from './integration.entity';
import { OAuthClient } from './oauth/oauth-client.entity';

export class CreateIntegrationRequest {
  @IsString()
  public readonly cxoneClientId: string;

  @IsString()
  public readonly cxoneClientSecret: string;

  @IsOptional()
  @IsString()
  public readonly integrationId: string;
}

export class UpdateIntegrationRequest {
  @IsOptional()
  @IsString()
  public readonly cxoneClientId: string;

  @IsOptional()
  @IsString()
  public readonly cxoneClientSecret: string;

  @IsOptional()
  @IsString()
  public readonly integrationId: string;
}

type authClient = {
  clientId: string;
  clientSecret?: string;
};

export class GetIntegrationResponse {
  constructor(integration: Integration) {
    this.id = integration.id;
    this.integrationAuth = {
      clientId: integration.oauthClient.clientId,
    };
    this.integrationId = integration.integrationId;
    this.integrationBoxUrl = integration.integrationBoxUrl;
    this.addActionUrl = integration.addActionUrl;
    this.reconnectActionUrl = integration.reconnectActionUrl;
    this.removeActionUrl = integration.removeActionUrl;
  }

  public id: string;
  public integrationAuth: authClient;
  public integrationId: string;
  public integrationBoxUrl: string;
  public addActionUrl: string;
  public reconnectActionUrl: string;
  public removeActionUrl: string;
  public middlewareClientId: string;
  public middlewareClientSecret: string;
}

export function GetIntegrationsResponse(
  integrations: Integration[],
): GetIntegrationResponse[] {
  return integrations.map(
    (integration) => new GetIntegrationResponse(integration),
  );
}

export class CreateIntegrationResponse extends GetIntegrationResponse {
  constructor(integration: Integration) {
    super(integration);
    this.integrationAuth.clientSecret = integration.oauthClient.clientSecret;
  }
}

export class RegenerateClientAuthResponse implements authClient {
  constructor(client: OAuthClient) {
    this.clientId = client.clientId;
    this.clientSecret = client.clientSecret;
  }

  public clientId: string;
  public clientSecret: string;
}

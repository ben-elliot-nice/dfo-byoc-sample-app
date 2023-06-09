import { IsString } from 'class-validator';

export class CreateIntegrationRequestDto {
  @IsString()
  public readonly cxoneClientId: string;

  @IsString()
  public readonly cxoneClientSecret: string;
}

export class UpdateIntegrationRequestDto {
  @IsString()
  public readonly cxoneClientId: string;

  @IsString()
  public readonly cxoneClientSecret: string;

  @IsString()
  public readonly integrationId: string;
}

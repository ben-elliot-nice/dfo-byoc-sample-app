import { Injectable } from '@nestjs/common';
import { OAuthClient } from './oauth-client.entity';
import { randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class OauthService {
  @InjectRepository(OAuthClient)
  private readonly clientRepository: Repository<OAuthClient>;

  public isSecretValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  public encodeSecret(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  public generateClientSecret(): string {
    return randomBytes(35).toString('base64');
  }

  public generateClientId(): string {
    return uuid();
  }

  public async create(secret: string): Promise<OAuthClient> {
    // Implement logic for generating and saving the oauthclient

    const client = new OAuthClient();
    client.clientId = this.generateClientId();
    client.clientSecret = this.encodeSecret(secret);

    await this.clientRepository.save(client);

    return client;
  }

  public async remove(id: number): Promise<OAuthClient> {
    const client = await this.clientRepository.findOne({ where: { id } });

    if (!client) {
      // throw new client ID not found
    }

    await this.clientRepository.remove(client);
    return client;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { Repository } from 'typeorm';
import { CreateIntegrationRequestDto } from './integration.dto';
import { Result } from '@/utils/result';

@Injectable()
export class IntegrationService {
  @InjectRepository(Integration)
  private readonly integrationRepository: Repository<Integration>;

  public async create(
    body: CreateIntegrationRequestDto,
  ): Promise<Result<Integration, HttpException>> {
    return Result.error(
      new HttpException('Not Implemented', HttpStatus.NOT_IMPLEMENTED),
    );
  }
}

import { Repository } from 'typeorm';
import { Integration } from './integration.entity';
import { IntegrationService } from './integration.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateIntegrationRequest } from './integration.dto';
import { IntegrationAlreadyExistsException } from './exceptions';
import { User } from '../user/user.entity';

describe('IntegrationService', () => {
  let integrationService: IntegrationService;
  let integrationRespository: Repository<Integration>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationService,
        {
          provide: getRepositoryToken(Integration),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    integrationService = module.get<IntegrationService>(IntegrationService);
    integrationRespository = module.get<Repository<Integration>>(
      getRepositoryToken(Integration),
    );
  });

  describe('createIntegration', () => {
    it('should throw an error if integrationId already exists', async () => {
      const integrationDto: CreateIntegrationRequest = {
        integrationId: 'abcdefg',
        cxoneClientId: 'clientId',
        cxoneClientSecret: 'clientSecret',
      };

      const user: User = new User();

      const returnedIntegration: Integration = new Integration();
      returnedIntegration.integrationId = integrationDto.integrationId;
      jest
        .spyOn(integrationRespository, 'findOne')
        .mockResolvedValue(returnedIntegration);

      await expect(
        integrationService.create(integrationDto, user),
      ).rejects.toThrow(IntegrationAlreadyExistsException);
    });

    test.todo('should create a new client using integration auth service');
    test.todo('should return an integration id when provided one');
    test.todo('should not return an integration when not provided');
  });
});

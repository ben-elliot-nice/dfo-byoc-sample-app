import { Test } from '@nestjs/testing';
import { IntegrationController } from './integration.controller';
import { IntegrationService } from './integration.service';
import {
  CreateIntegrationRequest,
  CreateIntegrationResponse,
} from './integration.dto';
import { Integration } from './integration.entity';
import { User } from '../user/user.entity';
import { Request } from 'express';

describe('IntegrationController', () => {
  let integrationController: IntegrationController;
  let integrationInput: CreateIntegrationRequest;
  let integrationOutput: Integration;
  let testUser: User;
  let mockRequest: Request;

  beforeEach(async () => {
    integrationInput = {
      cxoneClientId: 'Test Client ID',
      cxoneClientSecret: 'Test Client Secret',
      integrationId: 'abcd-1234-efgh-5678',
    };

    integrationOutput = new Integration();
    integrationOutput.id = '9876-zyxw-5432-vuts';
    integrationOutput.integrationId = integrationInput.integrationId;
    integrationOutput.cxoneClientId = integrationInput.cxoneClientId;
    integrationOutput.cxoneClientSecret = integrationInput.cxoneClientSecret;

    testUser = new User();
    testUser.email = 'test@mail.com';
    testUser.name = 'John McTesticle';
    testUser.password = 'TestPassword01';
    testUser.verified = true;

    mockRequest = { user: testUser } as unknown as Request;

    const moduleRef = await Test.createTestingModule({
      controllers: [IntegrationController],
      providers: [
        {
          provide: IntegrationService,
          useValue: {
            create: jest.fn().mockResolvedValue(integrationOutput),
          },
        },
      ],
    }).compile();

    integrationController = moduleRef.get<IntegrationController>(
      IntegrationController,
    );
  });

  describe('createIntegration', () => {
    it('should return CreateIntegrationResponse', async () => {
      const response = await integrationController.createIntegration(
        mockRequest,
        integrationInput,
      );
      expect(response).toEqual(
        new CreateIntegrationResponse(integrationOutput),
      );
    });
  });

  // describe('getIntegration', () => {
  //   it('should return CreateIntegrationResponse', async () => {
  //     const response = await integrationController.getIntegration(
  //       mockRequest,
  //       integrationInput,
  //     );
  //     expect(response).toEqual(
  //       new CreateIntegrationResponse(integrationOutput),
  //     );
  //   });
  // })
});

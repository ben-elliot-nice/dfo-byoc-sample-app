import { Test } from '@nestjs/testing';
import { UserAuthController } from './auth.controller';
import { UserAuthService } from './auth.service';
import { VerificationService } from '@/api/user/verification/verification.service';
import { User } from '../user.entity';
import { Request } from 'express';

describe('UserAuthController', () => {
  let authController: UserAuthController;
  let testUser;
  let testEntity: User;
  let token: string;

  beforeEach(async () => {
    testUser = {
      email: 'test@email.com',
      name: 'Test User',
      password: 'Should not be present',
      lastLoginAt: new Date(),
      verified: false,
    };
    testEntity = new User();
    testEntity.email = testUser.email;
    testEntity.name = testUser.name;
    testEntity.password = testUser.password;
    testEntity.lastLoginAt = testUser.lastLoginAt;
    testEntity.verified = testUser.verified;
    token = 'jwt.token';

    const moduleRef = await Test.createTestingModule({
      controllers: [UserAuthController],
      providers: [
        {
          provide: UserAuthService,
          useValue: {
            register: jest.fn().mockResolvedValue(testEntity),
            login: jest.fn().mockResolvedValue(token),
            refresh: jest.fn().mockResolvedValue(token),
          },
        },
        {
          provide: VerificationService,
          useValue: {
            verify: jest.fn().mockResolvedValue(testEntity),
          },
        },
      ],
    }).compile();

    authController = moduleRef.get<UserAuthController>(UserAuthController);
  });

  describe('register', () => {
    it('should return RegisterUserResponse object', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = testUser;
      const response = await authController.register(testUser);

      expect(response).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should return LoginResponse object', async () => {
      const body = {
        email: testUser.email,
        password: testUser.password,
      };
      const response = await authController.login(body);

      expect(response).toEqual({ token: token });
    });
  });

  describe('verify', () => {
    it('should return RegisterUserResponse object', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...expectedResult } = testUser;
      const body = { token };

      const response = await authController.verify(body);

      expect(response).toEqual(expectedResult);
    });
  });

  describe('refresh', () => {
    it('should return LoginResponse object', async () => {
      const token = 'jwt.token';

      const request = { user: testEntity } as unknown as Request;
      const response = await authController.refresh(request);

      expect(response).toEqual({ token: token });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { AuthService } from './auth.service';
import { VerificationService } from '@/api/user/verification/verification.service';
import { AuthHelper } from './auth.helper';
import { RegisterUserRequest, LoginRequest } from './auth.dto';
import { UserAlreadyExistsException, UserAuthFailed } from './exceptions';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let authHelper: AuthHelper;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AuthHelper,
          useValue: {
            encodePassword: jest.fn(),
            isPasswordValid: jest.fn(),
            generateToken: jest.fn(),
          },
        },
        {
          provide: VerificationService,
          useValue: {
            createVerification: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authHelper = module.get<AuthHelper>(AuthHelper);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const encodedPassword = 'encodedPassword';
      const userDto: RegisterUserRequest = {
        name: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';

      const expectedUser = user;
      expectedUser.password = encodedPassword;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(authHelper, 'encodePassword').mockReturnValue(encodedPassword);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await authService.register(userDto);
      expect(result).toEqual(user);
    });

    it('should throw an error when user already exists', async () => {
      const userDto: RegisterUserRequest = {
        name: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.id = 1;
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(authService.register(userDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });
  });

  describe('login', () => {
    it('should login an existing user', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.id = 1;
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';
      user.verified = true;
      user.lastLoginAt = new Date();

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authHelper, 'isPasswordValid').mockReturnValue(true);
      jest.spyOn(authHelper, 'generateToken').mockReturnValue('testToken');

      const result = await authService.login(loginRequest);
      expect(result).toEqual('testToken');
    });

    it('should throw an error when user cannot be found', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      await expect(authService.login(loginRequest)).rejects.toThrow(
        UserAuthFailed,
      );
    });

    it('should throw an error when password does not match', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.id = 1;
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';
      user.verified = false;
      user.lastLoginAt = new Date();

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authHelper, 'isPasswordValid').mockReturnValue(false);
      await expect(authService.login(loginRequest)).rejects.toThrow(
        UserAuthFailed,
      );
    });

    it('should throw an error when user is not verified', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = new User();
      user.id = 1;
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';
      user.verified = true;
      user.lastLoginAt = new Date();

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(authHelper, 'isPasswordValid').mockReturnValue(false);
      await expect(authService.login(loginRequest)).rejects.toThrow(
        UserAuthFailed,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh token for user', async () => {
      const user = new User();
      user.id = 1;
      user.name = 'test';
      user.email = 'test@example.com';
      user.password = 'password';
      user.verified = true;
      user.lastLoginAt = new Date();

      jest.spyOn(authHelper, 'generateToken').mockReturnValue('testToken');

      const result = await authService.refresh(user);
      expect(result).toEqual('testToken');
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { UserAuthHelper } from './auth.helper';
import { User } from '@/api/user/user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserAuthHelper', () => {
  let authHelper: UserAuthHelper;
  let jwtService: JwtService;
  let repo: Repository<User>;

  const mockJwtService = {
    decode: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthHelper,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    authHelper = module.get<UserAuthHelper>(UserAuthHelper);
    jwtService = module.get<JwtService>(JwtService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should decode a token', async () => {
    const result = { id: '1', email: 'test@example.com' };
    jest.spyOn(jwtService, 'decode').mockImplementation(() => result);
    expect(await authHelper.decode('token')).toEqual(result);
  });

  it('should validate a user', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    jest.spyOn(repo, 'findOne').mockResolvedValue(user);
    expect(await authHelper.validateUser({ id: '1' })).toEqual(user);
  });

  it('should generate a token', () => {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    jest.spyOn(jwtService, 'sign').mockReturnValue('token');
    expect(authHelper.generateToken(user)).toEqual('token');
  });

  it('should validate password', () => {
    const password = 'password';
    const hash = bcrypt.hashSync(password);
    expect(authHelper.isPasswordValid(password, hash)).toBeTruthy();
  });

  it('should encode password', () => {
    const password = 'password';
    const hash = authHelper.encodePassword(password);
    expect(bcrypt.compareSync(password, hash)).toBeTruthy();
  });

  it('should validate a JWT token', async () => {
    const user = new User();
    user.id = 1;
    user.email = 'test@example.com';
    jest.spyOn(jwtService, 'verify').mockReturnValue({ id: '1' });
    jest.spyOn(repo, 'findOne').mockResolvedValue(user);
    await expect(authHelper['validate']('token')).resolves.toBeTruthy();
  });
});

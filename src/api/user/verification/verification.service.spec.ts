import { Test } from '@nestjs/testing';
import { VerificationService } from './verification.service';
import { Verification } from './verification.entity';
import { User } from '../user.entity';
import { VerificationInvalidException } from './exceptions/verification-invalid.exception';
import { VerificationTimeException } from './exceptions/verification-time.exception';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Result } from '@/utils/result';

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let verificationRepositoryMock: any;
  let userRepositoryMock: any;
  let httpServiceMock: any;
  let configServiceMock: any;

  const mockVerification: Verification = {
    id: 1,
    token: 'mockToken',
    issuedAt: new Date(),
    user: {} as User,
  } as Verification;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'password',
    name: null,
    lastLoginAt: null,
    verified: false,
    verification: mockVerification,
  } as User;

  beforeEach(async () => {
    verificationRepositoryMock = {
      findOne: jest.fn(),
      remove: jest.fn(),
      save: jest.fn(),
    };

    userRepositoryMock = {
      save: jest.fn(),
    };

    httpServiceMock = {
      axiosRef: {
        request: jest.fn(),
      },
    };

    configServiceMock = {
      get: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: getRepositoryToken(Verification),
          useValue: verificationRepositoryMock,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        { provide: HttpService, useValue: httpServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    verificationService =
      moduleRef.get<VerificationService>(VerificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVerificationByToken', () => {
    it('should return the verification when a valid token is provided', async () => {
      verificationRepositoryMock.findOne.mockResolvedValue(mockVerification);

      const result = await verificationService.getVerificationByToken(
        'mockToken',
      );

      expect(result.isOk()).toBe(true);
      expect(result.value).toEqual(mockVerification);
    });

    it('should return an error message when an invalid token is provided', async () => {
      verificationRepositoryMock.findOne.mockResolvedValue(undefined);

      const result = await verificationService.getVerificationByToken(
        'invalidToken',
      );

      expect(result.isError()).toBe(true);
      expect(result.error).toBe("No verification token 'invalidToken' found");
    });
  });

  describe('removeVerification', () => {
    it('should remove the verification when a valid verification object is provided', async () => {
      const deleteResult = { raw: [], affected: 1 };
      verificationRepositoryMock.remove.mockResolvedValue(deleteResult);

      const result = await verificationService.removeVerification(
        mockVerification,
      );

      expect(result.isOk()).toBe(true);
      expect(verificationRepositoryMock.remove).toHaveBeenCalledWith(
        mockVerification,
      );
    });

    it('should throw an error when an invalid verification object is provided', async () => {
      verificationRepositoryMock.remove.mockResolvedValue(undefined);

      await expect(
        verificationService.removeVerification({} as Verification),
      ).rejects.toThrow("Problem removing verification with token 'undefined'");
    });
  });

  describe('sendVerification', () => {
    it('should throw an error when failed to send the verification email', async () => {
      httpServiceMock.axiosRef.request.mockRejectedValue(
        new Error('Network Error'),
      );

      await expect(
        verificationService.sendVerification(mockVerification, mockUser),
      ).rejects.toThrow('Failed to send welcome email: Network Error');
    });
  });

  describe('validateIssuedTime', () => {
    it('should return ok when the verification issued time is within the allowed range', () => {
      const verification = { ...mockVerification } as Verification;
      verification.issuedAt = new Date();

      const result = verificationService.validateIssuedTime(verification);

      expect(result.isOk()).toBe(true);
    });

    it('should return an error when the verification issued time is older than the allowed range', () => {
      const verification = { ...mockVerification } as Verification;
      verification.issuedAt = new Date('2022-01-01');

      const result = verificationService.validateIssuedTime(verification);

      expect(result.isError()).toBe(true);
      expect(result.error).toBe(
        `Rejecting verification request, token ${verification.token} issued at ${verification.issuedAt} is too old`,
      );
    });
  });

  describe('createVerification', () => {
    it('should remove the existing verification, generate a new token, save the verification, and send the verification email', async () => {
      const generateUniqueTokenSpy = jest
        .spyOn(verificationService, 'generateUniqueToken')
        .mockResolvedValue('newToken');
      const removeVerificationSpy = jest
        .spyOn(verificationService, 'removeVerification')
        .mockResolvedValue(Result.ok(null));
      const sendVerificationSpy = jest.spyOn(
        verificationService,
        'sendVerification',
      );

      const saveVerificationMock = jest.fn();
      verificationRepositoryMock.save.mockImplementationOnce(
        saveVerificationMock,
      );

      const user = { ...mockUser, verification: mockVerification } as User;

      const verification = await verificationService.createVerification(user);

      expect(removeVerificationSpy).toHaveBeenCalledWith(mockVerification);
      expect(generateUniqueTokenSpy).toHaveBeenCalled();
      expect(saveVerificationMock).toHaveBeenCalledWith({
        token: 'newToken',
        user,
      });
      expect(sendVerificationSpy).toHaveBeenCalledWith(
        { token: 'newToken', user },
        user,
      );
      expect(verification).toEqual({ token: 'newToken', user });
    });
  });

  describe('verify', () => {
    const validToken = 'validToken';
    const invalidToken = 'invalidToken';

    it('should update relevant table details and remove the verification when a valid token is provided', async () => {
      const removeVerificationSpy = jest
        .spyOn(verificationService, 'removeVerification')
        .mockImplementation(() => null);

      verificationRepositoryMock.findOne.mockResolvedValueOnce(
        mockVerification,
      );

      const saveUserMock = jest.fn();
      userRepositoryMock.save.mockImplementationOnce(saveUserMock);

      const expectedUser = mockVerification.user;
      expectedUser.verified = true;

      const result = await verificationService.verify({ token: validToken });

      expect(verificationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { token: validToken },
        relations: { user: true },
      });
      expect(saveUserMock).toHaveBeenCalled();
      expect(removeVerificationSpy).toHaveBeenCalledWith(mockVerification);
      expect(result).toBe(expectedUser);
    });

    it('should throw a VerificationInvalidException when an invalid token is provided', async () => {
      await expect(
        verificationService.verify({ token: invalidToken }),
      ).rejects.toThrow(VerificationInvalidException);
      expect(verificationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { token: invalidToken },
        relations: { user: true },
      });
    });

    it('should throw a VerificationTimeException when a token with an old issued time is provided', async () => {
      const verificationWithOldTime = { ...mockVerification };
      verificationWithOldTime.issuedAt = new Date('2022-01-01');
      verificationRepositoryMock.findOne.mockResolvedValueOnce(
        verificationWithOldTime,
      );

      await expect(
        verificationService.verify({ token: validToken }),
      ).rejects.toThrow(VerificationTimeException);
      expect(verificationRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { token: validToken },
        relations: { user: true },
      });
    });
  });
});

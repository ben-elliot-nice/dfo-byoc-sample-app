import { Result } from '@/utils/result';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosRequestConfig } from 'axios';
import { randomBytes } from 'crypto';
import * as FormData from 'form-data';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { Verification } from './verification.entity';
import { VerifyDto } from '../auth/auth.dto';

@Injectable()
export class VerificationService {
  @InjectRepository(Verification)
  private readonly verificationRepository: Repository<Verification>;

  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  @Inject()
  private readonly http: HttpService;

  @Inject(ConfigService)
  private readonly config: ConfigService;

  private async getVerificationByToken(
    token: string,
  ): Promise<Result<Verification, Error>> {
    const verification: Verification =
      await this.verificationRepository.findOne({
        where: { token },
        relations: {
          user: true,
        },
      });

    if (verification) {
      return Result.ok(verification);
    } else {
      return Result.error(new Error(`No verification token '${token}' found`));
    }
  }

  private async removeVerification(
    verification: Verification,
  ): Promise<Result<null, HttpException>> {
    const deleteResult = await this.verificationRepository.remove(verification);
    if (deleteResult) {
      return Result.ok(null);
    } else {
      return Result.error(
        new HttpException(
          `Problem removing verification with token '${verification.token}'`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }

  private async sendVerification(
    verification: Verification,
    user: User,
  ): Promise<Result<null, Error>> {
    const { email } = user;
    const mailGunToken = this.config.get<string>('MAILGUN_API_KEY');

    const form = new FormData();
    form.append('from', 'BYOC Demo Admin <noreply@mg.benelliot-nice.com>');
    form.append('to', email);
    form.append('subject', 'Welcome to the BYOC demo platform');
    form.append('text', `Your verification token is: ${verification.token}`);

    const config: AxiosRequestConfig = {
      method: 'post',
      url: 'https://api.mailgun.net/v3/mg.benelliot-nice.com/messages',
      data: form,
      headers: {
        ...form.getHeaders(),
        Authorization: `Basic ${Buffer.from(`api:${mailGunToken}`).toString(
          'base64',
        )}`,
      },
    };

    try {
      await this.http.axiosRef.request(config);
      return Result.ok(null);
    } catch (error) {
      return Result.error(
        new HttpException(
          `Failed to send welcome email: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }

  private async generateUniqueToken(): Promise<string> {
    // Generate a new verification token
    const token = randomBytes(35).toString('base64');

    // Check if token exists already
    const existingVerificationResult = await this.getVerificationByToken(token);

    if (existingVerificationResult.isOk()) {
      return await this.generateUniqueToken();
    } else {
      return token;
    }
  }

  private validateIssuedTime(verification: Verification): Result<null, Error> {
    if (new Date().getTime() - verification.issuedAt.getTime() > 86400000) {
      return Result.error(new Error('Verification Token Timed Out'));
    } else {
      return Result.ok(null);
    }
  }

  public async createVerification(user: User): Promise<Result<null, Error>> {
    // check to see if this user has any existing verifications.
    const existingVerification = user.verification;

    // Remove the verification if it exists.
    if (existingVerification) {
      await this.verificationRepository.remove(existingVerification);
    }

    // Generate a new verification token
    const token = await this.generateUniqueToken();

    // Create a new Verification entity and link to user.
    const verification = new Verification();
    verification.token = token;
    verification.user = user;
    await this.verificationRepository.save(verification);

    // Send verification
    return await this.sendVerification(verification, user);
  }

  public async verify(body: VerifyDto): Promise<Result<User, HttpException>> {
    const { token } = body;

    // Check to see if there is an active verification for this token
    const getVerificationResult = await this.getVerificationByToken(token);

    if (getVerificationResult.isError()) {
      return Result.error(
        new HttpException(
          getVerificationResult.error.message,
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    // Check verification is within allowed time
    const verification = getVerificationResult.value;
    const validateIssuedTimeResult = this.validateIssuedTime(verification);

    if (validateIssuedTimeResult.isError()) {
      return Result.error(
        new HttpException(
          validateIssuedTimeResult.error.message,
          HttpStatus.BAD_REQUEST,
        ),
      );
    }

    // Update relevant table details.
    const user = verification.user;
    user.verified = true;
    await this.userRepository.save(user);
    await this.removeVerification(verification);

    return Result.ok(user);
  }
}
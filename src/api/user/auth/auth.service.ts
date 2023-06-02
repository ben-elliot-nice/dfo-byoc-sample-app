import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, LoginDto } from './auth.dto';
import { AuthHelper } from './auth.helper';
import { VerificationService } from '../verification/verification.service';
import { Result } from '@/utils/result';

@Injectable()
export class AuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(AuthHelper)
  private readonly helper: AuthHelper;

  @Inject(VerificationService)
  private readonly verification: VerificationService;

  public async register(
    body: RegisterDto,
  ): Promise<Result<User, HttpException>> {
    const { name, email, password }: RegisterDto = body;
    Logger.debug(
      `Executing registration request: ${JSON.stringify({ name, email })}`,
    );

    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      Logger.warn(`Cannot register new user, ${email} already exists`);
      return Result.error(new HttpException('Conflict', HttpStatus.CONFLICT));
    }

    user = new User();

    user.name = name;
    user.email = email;
    user.password = this.helper.encodePassword(password);

    await this.repository.save(user);
    await this.verification.createVerification(user);

    return Result.ok(user);
  }

  public async login(body: LoginDto): Promise<Result<string, HttpException>> {
    const { email, password }: LoginDto = body;
    Logger.debug(`Executing login request: ${JSON.stringify({ email })}`);

    const user: User = await this.repository.findOne({
      where: { email },
    });

    if (!user) {
      Logger.warn(`Rejecting login request, user ${email} not found.`);
      return Result.error(
        new HttpException('No user found', HttpStatus.NOT_FOUND),
      );
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      Logger.warn(
        `Rejecting login request, password for ${email} not matched.`,
      );
      return Result.error(
        new HttpException('No user found', HttpStatus.NOT_FOUND),
      );
    }

    if (!user.verified) {
      Logger.warn(`Rejecting login request, user ${email} not verified.`);
      return Result.error(
        new HttpException('User not yet verified', HttpStatus.FORBIDDEN),
      );
    }

    this.repository.update(user.id, { lastLoginAt: new Date() });

    return Result.ok(this.helper.generateToken(user));
  }

  public async refresh(user: User): Promise<Result<string, HttpException>> {
    Logger.debug(`Executing refresh request: ${JSON.stringify(user)}`);
    this.repository.update(user.id, { lastLoginAt: new Date() });

    return Result.ok(this.helper.generateToken(user));
  }
}

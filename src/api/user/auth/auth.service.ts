import { User } from '@/api/user/user.entity';
import { VerificationService } from '@/api/user/verification/verification.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginRequest, RegisterUserRequest } from './auth.dto';
import { UserAuthHelper } from './auth.helper';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserAuthFailed } from './exceptions/user-auth-failed.exception';

@Injectable()
export class UserAuthService {
  @InjectRepository(User)
  private readonly repository: Repository<User>;

  @Inject(UserAuthHelper)
  private readonly helper: UserAuthHelper;

  @Inject(VerificationService)
  private readonly verification: VerificationService;

  public async register(body: RegisterUserRequest): Promise<User> {
    const { name, email, password }: RegisterUserRequest = body;
    Logger.debug(
      `Executing registration request: ${JSON.stringify({ name, email })}`,
    );

    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
      throw new UserAlreadyExistsException(
        `Cannot register new user, ${email} already exists`,
      );
    }

    user = new User();

    user.name = name;
    user.email = email;
    user.password = this.helper.encodePassword(password);
    await this.repository.save(user);

    await this.verification.createVerification(user);

    return user;
  }

  public async login(body: LoginRequest): Promise<string> {
    const { email, password }: LoginRequest = body;
    Logger.debug(`Executing login request: ${JSON.stringify({ email })}`);

    const user: User = await this.repository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UserAuthFailed(
        `Rejecting login request, user ${email} not found.`,
      );
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UserAuthFailed(
        `Rejecting login request, password for ${email} not matched.`,
      );
    }

    if (!user.verified) {
      throw new UserAuthFailed(
        `Rejecting login request, user ${email} not verified.`,
      );
    }

    this.repository.update(user.id, { lastLoginAt: new Date() });

    return this.helper.generateToken(user);
  }

  public async refresh(user: User): Promise<string> {
    Logger.debug(`Executing refresh request: ${JSON.stringify(user)}`);
    this.repository.update(user.id, { lastLoginAt: new Date() });

    return this.helper.generateToken(user);
  }
}

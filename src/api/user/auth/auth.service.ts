import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
    let user: User = await this.repository.findOne({ where: { email } });

    if (user) {
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
    const user: User = await this.repository.findOne({
      where: { email },
    });

    if (!user) {
      return Result.error(
        new HttpException('No user found', HttpStatus.NOT_FOUND),
      );
    }

    const isPasswordValid: boolean = this.helper.isPasswordValid(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return Result.error(
        new HttpException('No user found', HttpStatus.NOT_FOUND),
      );
    }

    if (!user.verified) {
      return Result.error(
        new HttpException('User not yet verified', HttpStatus.FORBIDDEN),
      );
    }

    this.repository.update(user.id, { lastLoginAt: new Date() });

    return Result.ok(this.helper.generateToken(user));
  }

  public async refresh(user: User): Promise<Result<string, HttpException>> {
    this.repository.update(user.id, { lastLoginAt: new Date() });

    return Result.ok(this.helper.generateToken(user));
  }
}

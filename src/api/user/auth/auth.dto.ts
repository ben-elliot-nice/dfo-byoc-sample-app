import { Trim } from 'class-sanitizer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../user.entity';

export class RegisterUserRequest {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  @MinLength(8)
  public readonly password: string;

  @IsString()
  @IsOptional()
  public readonly name?: string;
}

export class RegisterUserResponse {
  constructor(user: User) {
    this.email = user.email;
    this.name = user.name;
    this.lastLoginAt = user.lastLoginAt;
    this.verified = user.verified;
  }

  public email: string;
  public name: string;
  public lastLoginAt: Date | null;
  public verified: boolean;
}

export class LoginResponse {
  constructor(token: string) {
    this.token = token;
  }

  public token: string;
}

export class LoginRequest {
  @Trim()
  @IsEmail()
  public readonly email: string;

  @IsString()
  public readonly password: string;
}

export class VerifyRequest {
  @IsString()
  public readonly token: string;
}

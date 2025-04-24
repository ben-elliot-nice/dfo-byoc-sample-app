import { User } from '@/api/user/user.entity';
import { VerificationService } from '@/api/user/verification/verification.service';
import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  LoginRequest,
  LoginResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  VerifyRequest,
} from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { UserAuthService } from './auth.service';

@Controller('/api/v1/auth')
export class UserAuthController {
  @Inject(UserAuthService)
  private readonly authService: UserAuthService;

  @Inject(VerificationService)
  private readonly verificationService: VerificationService;

  @Post('register')
  async register(
    @Body() body: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    const user = await this.authService.register(body);

    return new RegisterUserResponse(user);
  }

  @Post('login')
  async login(@Body() body: LoginRequest): Promise<LoginResponse> {
    const token = await this.authService.login(body);

    return new LoginResponse(token);
  }

  @Post('verify')
  async verify(@Body() body: VerifyRequest): Promise<RegisterUserResponse> {
    const user = await this.verificationService.verify(body);

    return new RegisterUserResponse(user);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Req() { user }: Request): Promise<LoginResponse> {
    const token = await this.authService.refresh(<User>user);

    return new LoginResponse(token);
  }
}

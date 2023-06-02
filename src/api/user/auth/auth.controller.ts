import {
  Body,
  Controller,
  Inject,
  Post,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { User } from '@/api/user/user.entity';
import { RegisterDto, LoginDto, VerifyDto } from './auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { VerificationService } from '../verification/verification.service';

@Controller('/api/v1/auth')
export class AuthController {
  @Inject(AuthService)
  private readonly authService: AuthService;

  @Inject(VerificationService)
  private readonly verificationService: VerificationService;

  @Post('register')
  @UseInterceptors(ClassSerializerInterceptor)
  private async register(@Body() body: RegisterDto) {
    const registerUserResult = await this.authService.register(body);

    if (registerUserResult.isError()) {
      throw registerUserResult.error;
    } else {
      return registerUserResult.value;
    }
  }

  @Post('login')
  private async login(@Body() body: LoginDto) {
    const loginResult = await this.authService.login(body);

    if (loginResult.isError()) {
      throw loginResult.error;
    } else {
      return loginResult.value;
    }
  }

  @Post('verify')
  private async verify(@Body() body: VerifyDto) {
    const verificationResult = await this.verificationService.verify(body);

    if (verificationResult.isError()) {
      throw verificationResult.error;
    } else {
      return verificationResult.value;
    }
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  private async refresh(@Req() { user }: Request): Promise<string | never> {
    const refreshResult = await this.authService.refresh(<User>user);

    if (refreshResult.isError()) {
      throw refreshResult.error;
    } else {
      return refreshResult.value;
    }
  }
}

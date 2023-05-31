import { Controller, Logger, Post } from '@nestjs/common';

@Controller('api/v1/auth')
export class UserController {
  @Post('register')
  async registerUser() {
    Logger.debug('Processing registerUser request');
  }

  @Post('reset-password')
  async resetPassword() {
    Logger.debug('Processing resetPassword request');
  }

  @Post('login')
  async login() {
    Logger.debug('Processing login request');
  }

  @Post('refresh-token')
  async refreshToken() {
    Logger.debug('Processing refreshToken request');
  }
}

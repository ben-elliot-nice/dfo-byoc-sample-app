import { Module } from '@nestjs/common';
import { UserAuthModule } from './auth/auth.module';

@Module({
  controllers: [],
  providers: [],
  imports: [UserAuthModule],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [],
  providers: [],
  imports: [AuthModule],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { VerificationModule } from './user/verification/verification.module';

@Module({
  imports: [UserModule, VerificationModule],
})
export class ApiModule {}

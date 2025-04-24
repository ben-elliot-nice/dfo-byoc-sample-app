import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { VerificationModule } from './user/verification/verification.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [UserModule, VerificationModule, IntegrationModule],
})
export class ApiModule {}

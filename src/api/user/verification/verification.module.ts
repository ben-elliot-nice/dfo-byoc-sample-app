import { Module } from '@nestjs/common';
import { Verification } from './verification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { VerificationService } from './verification.service';
import { User } from '../user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification]), HttpModule],
  controllers: [],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}

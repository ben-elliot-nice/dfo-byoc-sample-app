import { Module } from '@nestjs/common';
import { UserAuthModule } from './auth/auth.module';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User]), UserAuthModule],
  exports: [UserService],
})
export class UserModule {}

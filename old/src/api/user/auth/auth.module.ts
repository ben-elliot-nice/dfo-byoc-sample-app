import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/api/user/user.entity';
import { UserAuthController } from './auth.controller';
import { UserAuthHelper } from './auth.helper';
import { UserAuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { VerificationModule } from '../verification/verification.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt', property: 'user' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_KEY'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES') },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    VerificationModule,
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, UserAuthHelper, JwtStrategy],
})
export class UserAuthModule {}

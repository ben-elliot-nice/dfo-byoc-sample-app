import { Module } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClient } from './oauth-client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OAuthClient])],
  providers: [OauthService],
  exports: [OauthService],
})
export class OauthModule {}

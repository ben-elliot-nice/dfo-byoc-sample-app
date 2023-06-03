import { Module } from '@nestjs/common';
import { DfoModule } from './dfo/dfo.module';
import { ApiModule } from './api/api.module';
import { getEnvPath } from './common/helper/env.helper';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './shared/typeorm/typeorm.service';
import { ChatModule } from './chat/chat.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    ApiModule,
    DfoModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

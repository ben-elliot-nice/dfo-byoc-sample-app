import { Module } from '@nestjs/common';
import { DfoModule } from './dfo/dfo.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DfoModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

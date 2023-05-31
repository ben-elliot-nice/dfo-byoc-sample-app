import { Module } from '@nestjs/common';
import { DfoModule } from './dfo/dfo.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [DfoModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

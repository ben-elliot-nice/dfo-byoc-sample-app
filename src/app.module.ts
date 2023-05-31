import { Module } from '@nestjs/common';
import { DfoModule } from './dfo/dfo.module';

@Module({
  imports: [DfoModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

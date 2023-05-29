import { Module } from '@nestjs/common';
import { DfoModule } from './dfo/dfo.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [DfoModule, AdminModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ActionController } from './action/action.controller';
import { ActionService } from './action/action.service';
import { CallbackController } from './callback/callback.controller';
import { CallbackService } from './callback/callback.service';
import { oAuthServerModel } from './callback/oauthServerModel.service';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ActionAuthenticatedMiddleware } from './action/action.middleware';

@Module({
  controllers: [ActionController, CallbackController],
  providers: [ActionService, CallbackService, oAuthServerModel],
  imports: [HttpModule, JwtModule.register({}), CacheModule.register()],
})
export class DfoModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ActionAuthenticatedMiddleware)
      .forRoutes('integration/action');
  }
}

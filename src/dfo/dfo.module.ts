import { Module } from '@nestjs/common';
import { ActionController } from './action/action.controller';
import { ActionService } from './action/action.service';
import { CallbackController } from './callback/callback.controller';
import { CallbackService } from './callback/callback.service';
import { oAuthServerModel } from './callback/oauthServerModel.service';

@Module({
  controllers: [ActionController, CallbackController],
  providers: [ActionService, CallbackService, oAuthServerModel],
  imports: [],
})
export class DfoModule {}

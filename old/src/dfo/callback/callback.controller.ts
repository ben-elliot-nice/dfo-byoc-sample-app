import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CallbackService } from './callback.service';
import { v4 } from 'uuid';

@Controller('integration/box')
export class CallbackController {
  constructor(private callbackService: CallbackService) {}

  @Post('1.0/token')
  async getToken(@Req() req: Request) {
    const tokenResponse = await this.callbackService.getToken(req);
    console.log(tokenResponse);
    return tokenResponse;
  }

  @Post('1.0/posts/:id/messages')
  async processMessage(@Req() req: Request, @Res() res: Response) {
    await this.callbackService
      .validateBearer(req)
      .then((token) => {
        console.log(token);
        res.status(200);
        res.json({
          idOnExternalPlatform: v4(),
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(401).send();
      });
  }
}

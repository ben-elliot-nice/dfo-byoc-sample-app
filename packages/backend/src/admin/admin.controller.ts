import { Controller, Get, Logger } from '@nestjs/common';

@Controller('')
export class AdminController {
  @Get()
  index() {
    Logger.log('Handling index route');
  }
}

import { HttpStatus } from '@nestjs/common';
import {
  BusinessExceptionBase,
  IBusinessExceptionBase,
} from '@/common/exceptions/base.exception';

export class IntegrationNotFoundException
  extends BusinessExceptionBase
  implements IBusinessExceptionBase
{
  constructor(message) {
    super(message);
    this.name = 'IntegrationNotFoundException';
    this.status = HttpStatus.NOT_FOUND;
  }
}

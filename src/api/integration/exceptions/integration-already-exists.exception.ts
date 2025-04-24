import { HttpStatus } from '@nestjs/common';
import {
  BusinessExceptionBase,
  IBusinessExceptionBase,
} from '@/common/exceptions/base.exception';

export class IntegrationAlreadyExistsException
  extends BusinessExceptionBase
  implements IBusinessExceptionBase
{
  constructor(message) {
    super(message);
    this.name = 'IntegrationAlreadyExistsException';
    this.status = HttpStatus.CONFLICT;
  }
}

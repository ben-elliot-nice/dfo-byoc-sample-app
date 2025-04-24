import { HttpStatus } from '@nestjs/common';
import {
  BusinessExceptionBase,
  IBusinessExceptionBase,
} from '@/common/exceptions/base.exception';

export class VerificationInvalidException
  extends BusinessExceptionBase
  implements IBusinessExceptionBase
{
  constructor(message) {
    super(message);
    this.name = 'VerificationInvalidException';
    this.status = HttpStatus.BAD_REQUEST;
  }
}

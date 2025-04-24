import { HttpStatus } from '@nestjs/common';
import {
  BusinessExceptionBase,
  IBusinessExceptionBase,
} from '@/common/exceptions/base.exception';

export class UserAlreadyExistsException
  extends BusinessExceptionBase
  implements IBusinessExceptionBase
{
  constructor(message) {
    super(message);
    this.name = 'UserAlreadyExistsException';
    this.status = HttpStatus.CONFLICT;
  }
}

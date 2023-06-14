import { HttpStatus } from '@nestjs/common';
import {
  BusinessExceptionBase,
  IBusinessExceptionBase,
} from '@/common/exceptions/base.exception';

export class UserAuthFailed
  extends BusinessExceptionBase
  implements IBusinessExceptionBase
{
  constructor(message) {
    super(message);
    this.name = 'UserAuthFailed';
    this.status = HttpStatus.FORBIDDEN;
  }
}

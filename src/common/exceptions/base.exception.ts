import { HttpStatus } from '@nestjs/common';

export interface IBusinessExceptionBase {
  name: string;
  status: number;
}

export class BusinessExceptionBase extends Error {
  public status: HttpStatus;

  constructor(message) {
    super(message);
    this.name = 'BusinessExceptionBase';
  }
}

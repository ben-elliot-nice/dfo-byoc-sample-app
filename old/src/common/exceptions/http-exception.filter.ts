import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessExceptionBase } from './base.exception';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let status = 500;

    Logger.warn(exception.message);
    if (exception instanceof BusinessExceptionBase) {
      // It's a business logic exception
      status = exception.status;
    } else if (exception instanceof HttpException) {
      // It's a built in nest exception
      status = exception.getStatus();
    } else {
      // It's an unexpected exception
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      exception: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

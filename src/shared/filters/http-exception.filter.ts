import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type HttpExceptionBody = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

function isHttpExceptionBody(body: unknown): body is HttpExceptionBody {
  if (typeof body !== 'object' || body === null) return false;
  return 'message' in body || 'error' in body || 'statusCode' in body;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (isHttpExceptionBody(res)) {
        if (res.message !== undefined) {
          message = res.message;
        }
        if (res.error !== undefined) {
          error = res.error;
        }
      }
    }

    this.logger.error(
      `HTTP ${status} ${request.method} ${request.url} - ${JSON.stringify({
        message,
        error,
      })}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

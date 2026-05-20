import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';

type PrismaError =
  | Prisma.PrismaClientKnownRequestError
  | Prisma.PrismaClientValidationError;

type ErrorMessage = string | string[];

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter<PrismaError> {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: ErrorMessage = 'Database error';

    if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data for this operation';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // KnownRequestError – mamy code
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Resource with this value already exists';
          break;

        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Requested resource was not found';
          break;

        case 'P2003':
          status = HttpStatus.CONFLICT;
          message =
            'Operation not allowed because a related record is missing or invalid';
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database constraint error';
          break;
      }
    }

    const errorCode =
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? exception.code
        : 'VALIDATION';

    this.logger.error(
      `Prisma error [${errorCode}] on ${request.method} ${request.url} -> ${exception.message}`,
    );

    response.status(status).json({
      statusCode: status,
      message,
      error: 'DatabaseError',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorResponse = isHttp ? (exception as HttpException).getResponse() : undefined;

    const payload: Record<string, any> = {
      time: new Date().toISOString(),
      method: request.method,
      path: request.url,
      status,
      ip: request.ip,
    };

    if (errorResponse && typeof errorResponse === 'object') {
      payload.error = errorResponse;
    } else if (typeof errorResponse === 'string') {
      payload.error = { message: errorResponse };
    }

    if (!isHttp) {
      payload.exception = (exception as any)?.name || 'Error';
      payload.message = (exception as any)?.message;
      payload.stack = (exception as any)?.stack?.split('\n').slice(0, 5).join('\n');
    }

    // Structured log
    this.logger.error(JSON.stringify(payload));

    const clientBody: any = {
      statusCode: status,
      message: payload.error?.message || payload.message || 'Internal server error',
      error: payload.error?.error || payload.exception || 'Error',
    };
    if (payload.error?.['message'] && Array.isArray(payload.error['message'])) {
      clientBody.validation = payload.error['message'];
    }

    response.status(status).json(clientBody);
  }
}

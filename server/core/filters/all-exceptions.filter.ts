import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

// Src: https://docs.nestjs.com/techniques/logger
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  /**
   * Logger instance
   *
   * @private
   * @memberof AllExceptionsFilter
   */
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    console.log(exception);

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // If we received 500 error then showing regular message. Otherwise showing more appropriate from Error
    const errMsg = status === 500 ? 'Internal server error' : (exception as HttpException)?.message;
    // For logging we are taking exception error or telling that we couldn't find it because
    // this message could be useful for debugging in case of 500
    const logError = (exception as HttpException)?.message ?? 'unknown message';

    // Logging error
    this.logger.error(logError, (exception as HttpException)?.stack, request.url);

    // Returning response with error to client
    response.status(status).json({
      statusCode: status,
      path: request.url,
      message: errMsg,
    });
  }
}

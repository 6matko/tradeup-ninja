import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request: Request = context.switchToHttp().getRequest();
    const { httpAdapter } = this.httpAdapterHost;
    const httpServer = httpAdapter.getHttpServer();

    let requestMethod;
    let requestUrl;

    try {
      requestMethod = httpServer.getRequestMethod(request);
      requestUrl = httpServer.getRequestUrl(request);
    } catch (error) {
      requestMethod = request.method;
      requestUrl = request.url;
    }

    console.log(`Caching 1. Request method: ${requestMethod} | Request URL: ${requestUrl}`);

    const isGetRequest = requestMethod === 'GET';
    const excludePaths = [];
    if (!isGetRequest || (isGetRequest && excludePaths.includes(requestUrl))) {
      return undefined;
    }
    const key = requestUrl;
    console.log(`Caching 2`, key);
    return key;
  }
}

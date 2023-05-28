import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PersonalizedHttpCacheInterceptor extends CacheInterceptor {
    trackBy(context: ExecutionContext): string | undefined {
        const request: Request = context.switchToHttp().getRequest();
        // Returning authorization header as key to make request personalized
        return request.headers.authorization;
    }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  message: string;
  data: T;
  time: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const now = new Date().toISOString();

    return next.handle().pipe(
      map((data: unknown): Response<T> => {
        if (
          data !== null &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data &&
          'data' in data &&
          'time' in data
        ) {
          return data as Response<T>;
        }

        return {
          code: 200,
          message: 'success',
          data: (data ?? null) as T,
          time: now,
        };
      }),
    );
  }
}

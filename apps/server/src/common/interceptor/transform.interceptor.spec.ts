import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let ctx: ExecutionContext;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
    ctx = {
      switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
    } as any;
  });

  async function run(data: any) {
    const next: CallHandler = { handle: () => of(data) };
    return lastValueFrom(interceptor.intercept(ctx, next));
  }

  it('应将原始数据包装为标准响应结构', async () => {
    const result = await run({ id: 1, name: 'tom' });

    expect(result.code).toBe(200);
    expect(result.message).toBe('success');
    expect(result.data).toEqual({ id: 1, name: 'tom' });
    expect(typeof result.time).toBe('string');
    // ISO 时间格式
    expect(new Date(result.time).toISOString()).toBe(result.time);
  });

  it('data 为 null 时返回 data: null', async () => {
    const result = await run(null);

    expect(result.data).toBeNull();
    expect(result.message).toBe('success');
  });

  it('已是标准响应结构时原样透传', async () => {
    const shaped = {
      code: 201,
      message: 'created',
      data: { id: 9 },
      time: '2026-01-01T00:00:00.000Z',
    };
    const result = await run(shaped);

    expect(result).toStrictEqual(shaped);
  });

  it('基本类型数据应被包装', async () => {
    const result = await run('plain string' as any);

    expect(result.code).toBe(200);
    expect(result.data).toBe('plain string');
  });
});

import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

interface MockResponse {
  code: jest.Mock;
  send: jest.Mock;
}

function createHost(): { host: ArgumentsHost; res: MockResponse; req: any } {
  const res: MockResponse = {
    code: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  const req = { method: 'POST', url: '/api/test' };
  const host: ArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => res,
      getRequest: () => req,
    }),
  } as any;
  return { host, res, req };
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('HttpException 字符串 message', () => {
    const { host, res } = createHost();
    const exc = new HttpException('forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exc, host);

    expect(res.code).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.FORBIDDEN,
        message: 'forbidden',
        data: null,
      }),
    );
  });

  it('HttpException 对象 message', () => {
    const { host, res } = createHost();
    const exc = new HttpException(
      { message: '字段错误', error: 'Bad Request' },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exc, host);

    expect(res.code).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.BAD_REQUEST,
        message: '字段错误',
      }),
    );
  });

  it('HttpException 数组 message 应拼接为分号分隔字符串', () => {
    const { host, res } = createHost();
    const exc = new HttpException(
      { message: ['用户名不能为空', '密码不能为空'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exc, host);

    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '用户名不能为空; 密码不能为空',
      }),
    );
  });

  it('非 HttpException 的 Error 应返回 500', () => {
    const { host, res } = createHost();
    const exc = new Error('boom');

    filter.catch(exc, host);

    expect(res.code).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'boom',
      }),
    );
    // 500 错误应记录日志
    expect(errorSpy).toHaveBeenCalled();
  });

  it('未知异常应返回 500 并使用默认 message', () => {
    const { host, res } = createHost();

    filter.catch('strange thing', host);

    expect(res.code).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });

  it('4xx 错误不应记录 error 日志', () => {
    const { host } = createHost();
    const exc = new HttpException('bad', HttpStatus.BAD_REQUEST);

    filter.catch(exc, host);

    expect(errorSpy).not.toHaveBeenCalled();
  });
});

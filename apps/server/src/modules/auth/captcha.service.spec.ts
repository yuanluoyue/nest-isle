import * as svgCaptcha from 'svg-captcha';
import { CaptchaService } from './captcha.service';

// mock svg-captcha 以拿到可预测的验证码文本
jest.mock('svg-captcha', () => ({
  __esModule: true,
  create: jest.fn(),
}));

const mockedCreate = svgCaptcha.create as jest.MockedFunction<
  typeof svgCaptcha.create
>;

describe('CaptchaService', () => {
  let service: CaptchaService;

  beforeEach(() => {
    jest.useFakeTimers();
    mockedCreate.mockReset();
    service = new CaptchaService();
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  describe('generate', () => {
    it('应返回唯一的 captchaId 和 svg 字符串', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const a = service.generate();
      const b = service.generate();

      expect(a.captchaId).toBeTruthy();
      expect(a.captchaId).not.toBe(b.captchaId);
      expect(a.svg).toBe('<svg/>');
    });
  });

  describe('verify', () => {
    it('正确的小写校验码应校验通过', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'AbCD' });

      const { captchaId } = service.generate();
      // 存储时已转小写，传入大小写都应通过
      expect(service.verify(captchaId, 'abcd')).toBe(true);
    });

    it('错误的校验码应返回 false', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();
      expect(service.verify(captchaId, 'zzzz')).toBe(false);
    });

    it('未知的 captchaId 应返回 false', () => {
      expect(service.verify('non-existent', 'abcd')).toBe(false);
    });

    it('验证码一次性使用：成功后再验证返回 false', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();
      expect(service.verify(captchaId, 'abcd')).toBe(true);
      // 已被删除
      expect(service.verify(captchaId, 'abcd')).toBe(false);
    });

    it('验证码一次性使用：失败后同样被消耗', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();
      expect(service.verify(captchaId, 'wrong')).toBe(false);
      expect(service.verify(captchaId, 'abcd')).toBe(false);
    });

    it('过期的验证码应返回 false', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();

      // 推进时间超过 5 分钟有效期
      jest.setSystemTime(new Date(Date.now() + 6 * 60 * 1000));
      expect(service.verify(captchaId, 'abcd')).toBe(false);
    });

    it('未过期前应通过', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();
      jest.setSystemTime(new Date(Date.now() + 4 * 60 * 1000));
      expect(service.verify(captchaId, 'abcd')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('定时器触发后过期条目被清理', () => {
      mockedCreate.mockReturnValue({ data: '<svg/>', text: 'Abcd' });

      const { captchaId } = service.generate();

      // 推进时间超过 5 分钟
      jest.setSystemTime(new Date(Date.now() + 6 * 60 * 1000));

      // 触发 setInterval 回调（每分钟一次）
      jest.advanceTimersByTime(60_000);

      // 已被 cleanup 清理，无法再验证
      expect(service.verify(captchaId, 'abcd')).toBe(false);
    });
  });
});

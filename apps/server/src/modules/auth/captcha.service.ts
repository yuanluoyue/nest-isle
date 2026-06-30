import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { randomUUID } from 'crypto';

interface CaptchaEntry {
  text: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService implements OnModuleDestroy {
  private readonly captchas = new Map<string, CaptchaEntry>();
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor() {
    // 每分钟清理过期验证码
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    // setInterval 在 Node 中会阻止进程退出，unref 让其在没有其他任务时退出
    this.cleanupTimer.unref?.();
  }

  onModuleDestroy() {
    clearInterval(this.cleanupTimer);
    this.captchas.clear();
  }

  generate() {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: 'o0il1',
      noise: 3,
      color: true,
      width: 120,
      height: 40,
      fontSize: 40,
    });

    const captchaId = randomUUID();
    this.captchas.set(captchaId, {
      text: captcha.text.toLowerCase(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5分钟过期
    });

    return {
      captchaId,
      svg: captcha.data,
    };
  }

  verify(captchaId: string, code: string): boolean {
    const entry = this.captchas.get(captchaId);
    if (!entry) return false;

    this.captchas.delete(captchaId); // 验证码一次性使用

    if (Date.now() > entry.expiresAt) return false;

    return entry.text === code.toLowerCase();
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.captchas) {
      if (now > entry.expiresAt) {
        this.captchas.delete(id);
      }
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { randomUUID } from 'crypto';

interface CaptchaEntry {
  text: string;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly captchas = new Map<string, CaptchaEntry>();

  constructor() {
    // 每分钟清理过期验证码
    setInterval(() => this.cleanup(), 60_000);
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

import { Injectable, Logger } from '@nestjs/common';
import { eq, and, ilike, desc, SQL } from 'drizzle-orm';
import { sysLoginLog } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { QueryLoginLogDto } from './dto/query-login-log.dto';

export interface LoginLogPayload {
  userId?: string | null;
  username?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  status: number; // 0=成功 1=失败
  message?: string | null;
}

@Injectable()
export class LoginLogService {
  private readonly logger = new Logger(LoginLogService.name);

  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  /**
   * 写入登录日志（失败不抛异常，避免影响登录流程）
   */
  async record(data: LoginLogPayload) {
    try {
      const { browser, os } = this.parseUserAgent(data.userAgent);
      await this.db.insert(sysLoginLog).values({
        userId: data.userId ?? null,
        username: data.username ?? null,
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
        browser,
        os,
        status: data.status,
        message: data.message ?? null,
      });
    } catch (error) {
      this.logger.error(
        `Failed to write login log: ${(error as Error).message}`,
      );
    }
  }

  async findAll(query: QueryLoginLogDto) {
    const { page = 1, pageSize = 10, username, ip, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (username) conditions.push(ilike(sysLoginLog.username, `%${username}%`));
    if (ip) conditions.push(ilike(sysLoginLog.ip, `%${ip}%`));
    if (status !== undefined) conditions.push(eq(sysLoginLog.status, status));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [list, countResult] = await Promise.all([
      this.db.query.sysLoginLog.findMany({
        where,
        limit: pageSize,
        offset,
        orderBy: desc(sysLoginLog.createdAt),
      }),
      this.db.select({ id: sysLoginLog.id }).from(sysLoginLog).where(where),
    ]);

    return {
      list,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    return this.db.query.sysLoginLog.findFirst({
      where: eq(sysLoginLog.id, id),
    });
  }

  /**
   * 简单解析 UA，提取浏览器和操作系统
   */
  private parseUserAgent(ua?: string | null): {
    browser: string | null;
    os: string | null;
  } {
    if (!ua) return { browser: null, os: null };

    let browser: string | null = null;
    if (/Edg\//i.test(ua)) browser = 'Edge';
    else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Firefox';
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/MSIE|Trident/i.test(ua)) browser = 'IE';
    else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

    let os: string | null = null;
    if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Linux/i.test(ua)) os = 'Linux';

    return { browser, os };
  }
}

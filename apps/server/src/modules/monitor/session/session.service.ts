import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, ilike, desc, SQL, isNull } from 'drizzle-orm';
import { sysSession } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CacheService } from '../../../core/cache/cache.service';
import { LoggerService } from '../../../core/observability/logger/logger.service';
import { QuerySessionDto } from './dto/query-session.dto';
import { UAParser } from 'ua-parser-js';

const SESSION_PREFIX = 'session:';

interface CachedSession {
  sid: string;
  userId: string;
  userType: string;
  lastActiveAt?: number;
  [key: string]: unknown;
}

@Injectable()
export class SessionService {
  private logger: LoggerService;

  constructor(
    private databaseService: DatabaseService,
    private cacheService: CacheService,
    private loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('Session');
  }

  private get db() {
    return this.databaseService.db;
  }

  /** 创建会话（登录时调用） */
  async create(params: {
    userId: string;
    userType: string;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    const { userId, userType, ip, userAgent } = params;

    // 使同用户的旧 session 全部失效（踢掉旧设备）
    await this.invalidateUserSessions(userId);

    // 解析 UA
    let browser: string | null = null;
    let os: string | null = null;
    let device: string | null = null;
    let platform: string | null = null;

    if (userAgent) {
      const result = UAParser(userAgent);
      browser = result.browser.name ?? null;
      os = result.os.name ?? null;
      device = result.device.model ?? null;
      platform = result.os.name ?? null;
    }

    // 生成 sid
    const sid = crypto.randomUUID().replace(/-/g, '');

    // 写入数据库
    const [session] = await this.db
      .insert(sysSession)
      .values({
        sid,
        userId,
        userType,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        browser,
        os,
        device,
        platform,
      })
      .returning();

    // 写入 Redis
    await this.cacheService.set(
      `${SESSION_PREFIX}${sid}`,
      JSON.stringify({
        sid,
        userId,
        userType,
        ip: ip ?? null,
        loginAt: Math.floor(session.loginAt.getTime() / 1000),
        lastActiveAt: Math.floor(session.lastActiveAt.getTime() / 1000),
      }),
      7 * 24 * 3600, // 7 天 TTL
    );

    return session;
  }

  /** 验证 session 是否有效（鉴权时调用） */
  async validate(
    sid: string,
  ): Promise<{ userId: string; userType: string } | null> {
    const data = await this.cacheService.get(`${SESSION_PREFIX}${sid}`);
    if (!data) return null;

    try {
      const session = JSON.parse(data) as CachedSession;
      // 更新最后活跃时间
      session.lastActiveAt = Math.floor(Date.now() / 1000);
      await this.cacheService.set(
        `${SESSION_PREFIX}${sid}`,
        JSON.stringify(session),
        7 * 24 * 3600,
      );
      // 同步更新数据库
      await this.db
        .update(sysSession)
        .set({ lastActiveAt: new Date() })
        .where(eq(sysSession.sid, sid));
      return { userId: session.userId, userType: session.userType };
    } catch {
      return null;
    }
  }

  /** 强制下线（删除 session） */
  async forceLogout(id: string) {
    const session = await this.db.query.sysSession.findFirst({
      where: eq(sysSession.id, id),
    });
    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    // 删除 Redis
    await this.cacheService.del(`${SESSION_PREFIX}${session.sid}`);

    // 更新数据库
    await this.db
      .update(sysSession)
      .set({ logoutAt: new Date() })
      .where(eq(sysSession.id, id));

    return { success: true };
  }

  /** 查询会话列表 */
  async findAll(query: QuerySessionDto) {
    const { page = 1, pageSize = 10, userType, ip } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [];
    if (userType) conditions.push(eq(sysSession.userType, userType));
    if (ip) conditions.push(ilike(sysSession.ip, `%${ip}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // 查数据库获取所有匹配的 session
    const sessions = await this.db.query.sysSession.findMany({
      where,
      orderBy: desc(sysSession.loginAt),
    });

    // 检查 Redis 判断在线状态
    const enriched = await Promise.all(
      sessions.map(async (s) => {
        const online = !!(await this.cacheService.get(
          `${SESSION_PREFIX}${s.sid}`,
        ));
        return { ...s, online };
      }),
    );

    // 分页
    const total = enriched.length;
    const list = enriched.slice(offset, offset + pageSize);

    return { list, total, page, pageSize };
  }

  /** 用户主动登出 */
  async logout(sid: string) {
    const session = await this.db.query.sysSession.findFirst({
      where: eq(sysSession.sid, sid),
    });
    if (!session) return;

    await this.cacheService.del(`${SESSION_PREFIX}${sid}`);
    await this.db
      .update(sysSession)
      .set({ logoutAt: new Date() })
      .where(eq(sysSession.sid, sid));
  }

  /** 使某用户所有活跃 session 失效 */
  private async invalidateUserSessions(userId: string) {
    const activeSessions = await this.db.query.sysSession.findMany({
      where: and(
        eq(sysSession.userId, userId),
        isNull(sysSession.logoutAt),
      ),
      columns: { id: true, sid: true },
    });

    if (activeSessions.length === 0) return;

    // 批量删除 Redis 缓存 + 标记数据库 logoutAt
    await Promise.all(
      activeSessions.map(async (s) => {
        await this.cacheService.del(`${SESSION_PREFIX}${s.sid}`).catch(() => {});
        await this.db
          .update(sysSession)
          .set({ logoutAt: new Date() })
          .where(eq(sysSession.id, s.id));
      }),
    );

    this.logger.info({
      action: 'InvalidateOldSessions',
      message: 'Invalidated old sessions for user',
      data: { userId, count: activeSessions.length },
    });
  }
}

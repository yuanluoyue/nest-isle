import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, isNull, asc, inArray, not } from 'drizzle-orm';
import {
  sysUser,
  sysUserRole,
  sysRoleMenu,
  sysMenu,
} from '../../database/schema';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcryptjs';
import configuration from '../../config/configuration';
import { DatabaseService } from '../../database/database.service';
import { CaptchaService } from './captcha.service';
import { FileService } from '../file/file.service';
import { LoginLogService } from '../monitor/login-log/login-log.service';
import { SessionService } from '../monitor/session/session.service';
import { buildMenuTree } from './menu-tree.util';
import { LoggerService } from '../../core/observability/logger/logger.service';

export interface LoginContext {
  ip?: string | null;
  userAgent?: string | null;
}

/** JWT 载荷，对应 generateTokens 中 sign 的内容 */
interface CustomJwtPayload {
  sub: string;
  sid: string;
  type: string;
}

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private captchaService: CaptchaService,
    private fileService: FileService,
    private loginLogService: LoginLogService,
    private sessionService: SessionService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('Auth');
  }

  private get db() {
    return this.databaseService.db;
  }

  async login(dto: LoginDto, context: LoginContext = {}) {
    const ip = context.ip ?? null;
    const userAgent = context.userAgent ?? null;

    // 验证验证码
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      await this.loginLogService.record({
        username: dto.username,
        ip,
        userAgent,
        status: 1,
        message: '验证码错误或已过期',
      });
      throw new BadRequestException('验证码错误或已过期');
    }

    const user = await this.db.query.sysUser.findFirst({
      where: eq(sysUser.username, dto.username),
    });

    if (!user || !user.password || !compareSync(dto.password, user.password)) {
      this.logger.warn({
        action: 'LoginFailed',
        message: 'Login failed - wrong password',
        data: { username: dto.username },
      });
      await this.loginLogService.record({
        userId: user?.id ?? null,
        username: dto.username,
        ip,
        userAgent,
        status: 1,
        message: '用户名或密码错误',
      });
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status === 1) {
      await this.loginLogService.record({
        userId: user.id,
        username: dto.username,
        ip,
        userAgent,
        status: 1,
        message: '账号已被禁用',
      });
      throw new UnauthorizedException('账号已被禁用');
    }

    // 创建 session
    const session = await this.sessionService.create({
      userId: user.id,
      userType: 'admin',
      ip,
      userAgent,
    });

    // 签发 JWT（包含 sid 和 type）
    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      session.sid,
      'admin',
    );

    await this.loginLogService.record({
      userId: user.id,
      username: dto.username,
      ip,
      userAgent,
      status: 0,
      message: '登录成功',
    });

    this.logger.info({
      action: 'Login',
      message: 'User login',
      data: { userId: user.id, username: dto.username },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };
  }

  async profile(userId: string) {
    const user = await this.db.query.sysUser.findFirst({
      where: eq(sysUser.id, userId),
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      avatar: user.avatar,
      deptId: user.deptId,
      status: user.status,
    };
  }

  async updateProfile(
    userId: string,
    dto: {
      nickname?: string;
      email?: string;
      phone?: string;
      gender?: number;
      avatar?: string;
    },
  ) {
    let oldAvatar: string | null = null;
    if (dto.avatar !== undefined) {
      const current = await this.db.query.sysUser.findFirst({
        where: eq(sysUser.id, userId),
        columns: { avatar: true },
      });
      oldAvatar = current?.avatar ?? null;
    }

    await this.db
      .update(sysUser)
      .set({
        ...(dto.nickname !== undefined && { nickname: dto.nickname }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        updatedAt: new Date(),
      })
      .where(eq(sysUser.id, userId));

    if (dto.avatar !== undefined && oldAvatar && oldAvatar !== dto.avatar) {
      await this.fileService.deleteByUrl(oldAvatar);
    }

    return this.profile(userId);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(
        refreshToken,
      ) as unknown as CustomJwtPayload;
      // 校验 session 是否仍在 Redis 中有效
      const session = await this.sessionService.validate(payload.sid);
      if (!session) {
        throw new UnauthorizedException('会话已过期，请重新登录');
      }
      const { accessToken, refreshToken: newRefreshToken } =
        this.generateTokens(payload.sub, payload.sid, payload.type);

      this.logger.info({
        action: 'RefreshToken',
        message: 'Token refreshed',
        data: { userId: payload.sub },
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /** 登出 */
  async logout(sid: string) {
    await this.sessionService.logout(sid);
    this.logger.info({
      action: 'Logout',
      message: 'User logout',
      data: { userId: sid },
    });
  }

  private generateTokens(userId: string, sid: string, type: string) {
    const baseOptions: JwtSignOptions = {
      secret: this.configService.get<string>(
        'jwt.secret',
        configuration().jwt.secret,
      ),
      expiresIn: this.configService.get<string>(
        'jwt.expiresIn',
        configuration().jwt.expiresIn,
      ),
    };

    const accessToken = this.jwtService.sign(
      { sub: userId, sid, type },
      baseOptions,
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, sid, type },
      { ...baseOptions, expiresIn: '30d' },
    );

    return { accessToken, refreshToken };
  }

  async getUserMenus(userId: string) {
    const userRoles = await this.db.query.sysUserRole.findMany({
      where: eq(sysUserRole.userId, userId),
    });
    const roleIds = userRoles
      .map((ur) => ur.roleId)
      .filter(Boolean) as string[];

    if (roleIds.length === 0) {
      return [];
    }

    const roleMenus = await this.db.query.sysRoleMenu.findMany({
      where: inArray(sysRoleMenu.roleId, roleIds),
    });
    const menuIds = [...new Set(roleMenus.map((rm) => rm.menuId))].filter(
      Boolean,
    ) as string[];

    if (menuIds.length === 0) {
      return [];
    }

    const menus = await this.db.query.sysMenu.findMany({
      where: and(
        inArray(sysMenu.id, menuIds),
        isNull(sysMenu.deletedAt),
        eq(sysMenu.status, 0),
        not(eq(sysMenu.type, 2)),
      ),
      columns: {
        id: true,
        parentId: true,
        name: true,
        type: true,
        path: true,
        component: true,
        permission: true,
        icon: true,
        sort: true,
        visible: true,
        status: true,
      },
      orderBy: asc(sysMenu.sort),
    });

    return buildMenuTree(menus);
  }
}

import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq, and, isNull, asc, inArray, not } from 'drizzle-orm';
import { sysUser, sysUserRole, sysRoleMenu, sysMenu } from '../../database/schema';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcryptjs';
import configuration from '../../config/configuration';
import { DatabaseService } from '../../database/database.service';
import { CaptchaService } from './captcha.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private captchaService: CaptchaService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async login(dto: LoginDto) {
    // 验证验证码
    if (!this.captchaService.verify(dto.captchaId, dto.captchaCode)) {
      throw new BadRequestException('验证码错误或已过期');
    }

    const user = await this.db.query.sysUser.findFirst({
      where: eq(sysUser.username, dto.username),
    });

    if (!user || !user.password || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status === 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.username!);

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

  async updateProfile(userId: string, dto: { nickname?: string; email?: string; phone?: string; gender?: number; avatar?: string }) {
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

    return this.profile(userId);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(payload.sub, payload.username);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  private async generateTokens(userId: string, username: string) {
    const secret = this.configService.get<string>('jwt.secret', configuration().jwt.secret);
    const expiresIn = this.configService.get<string>('jwt.expiresIn', configuration().jwt.expiresIn);

    const accessToken = this.jwtService.sign(
      { sub: userId, username },
      { secret, expiresIn } as any,
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, username },
      { secret, expiresIn: '30d' } as any,
    );

    return { accessToken, refreshToken };
  }

  async getUserMenus(userId: string) {
    // 1. 获取用户所有角色ID
    const userRoles = await this.db.query.sysUserRole.findMany({
      where: eq(sysUserRole.userId, userId),
    });
    const roleIds = userRoles.map((ur) => ur.roleId).filter(Boolean) as string[];

    if (roleIds.length === 0) {
      return [];
    }

    // 2. 获取角色关联的所有菜单ID
    const roleMenus = await this.db.query.sysRoleMenu.findMany({
      where: inArray(sysRoleMenu.roleId, roleIds),
    });
    const menuIds = [...new Set(roleMenus.map((rm) => rm.menuId))].filter(Boolean) as string[];

    if (menuIds.length === 0) {
      return [];
    }

    // 3. 查询菜单详情（只查目录和菜单，不查按钮；状态正常；未删除）
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

    // 4. 构建树形结构
    return this.buildTree(menus);
  }

  private buildTree(menus: any[]) {
    const map = new Map<string, any>();
    const roots: any[] = [];

    menus.forEach((m) => {
      map.set(m.id, { ...m, children: [] });
    });

    menus.forEach((m) => {
      const node = map.get(m.id)!;
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    const clean = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.children.length === 0) {
          delete n.children;
        } else {
          clean(n.children);
        }
      });
    };
    clean(roots);

    return roots;
  }
}

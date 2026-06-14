import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { sysUser } from '../../database/schema';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcryptjs';
import configuration from '../../config/configuration';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  private get db() {
    return this.databaseService.db;
  }

  async login(dto: LoginDto) {
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
}

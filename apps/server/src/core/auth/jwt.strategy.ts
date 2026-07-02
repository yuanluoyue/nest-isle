import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../../modules/monitor/session/session.service';
import { PermissionService } from './permission.service';
import configuration from '../../config/configuration';
import { LoggerService } from '../logger/logger.service';

export interface JwtPayload {
  sub: string;
  sid: string;
  type: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: LoggerService;

  constructor(
    configService: ConfigService,
    private sessionService: SessionService,
    private permissionService: PermissionService,
    loggerService: LoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'jwt.secret',
        configuration().jwt.secret,
      ),
    });
    this.logger = loggerService.child('Auth');
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.sid) {
      this.logger.warn({
        action: 'JWTVerifyFailed',
        message: 'JWT verify failed',
        data: { reason: 'Missing sub or sid' },
      });
      throw new UnauthorizedException('无效的令牌');
    }

    // 校验 session 是否在 Redis 中
    const session = await this.sessionService.validate(payload.sid);
    if (!session) {
      this.logger.warn({
        action: 'JWTVerifyFailed',
        message: 'JWT verify failed',
        data: { reason: 'Session expired' },
      });
      throw new UnauthorizedException('会话已过期，请重新登录');
    }

    // 加载用户权限（实时查询，权限变更即时生效）
    const permissions = await this.permissionService.getPermissions(
      payload.sub,
    );

    this.logger.info({
      action: 'JWTVerify',
      message: 'JWT verified',
      data: { userId: payload.sub },
    });

    return {
      id: payload.sub,
      sid: payload.sid,
      type: payload.type,
      permissions,
    };
  }
}

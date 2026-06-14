import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../../modules/monitor/session/session.service';
import configuration from '../../config/configuration';

export interface JwtPayload {
  sub: string;
  sid: string;
  type: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private sessionService: SessionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'jwt.secret',
        configuration().jwt.secret,
      ),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.sid) {
      throw new UnauthorizedException('无效的令牌');
    }

    // 校验 session 是否在 Redis 中
    const session = await this.sessionService.validate(payload.sid);
    if (!session) {
      throw new UnauthorizedException('会话已过期，请重新登录');
    }

    return { id: payload.sub, sid: payload.sid, type: payload.type };
  }
}

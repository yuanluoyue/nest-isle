import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PermissionService } from './permission.service';
import { PermissionsGuard } from './permissions.guard';
import { SessionFeatureModule } from '../../modules/monitor/session/session.module';
import { DatabaseModule } from '../../database/database.module';
import configuration from '../../config/configuration';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'jwt.secret',
          configuration().jwt.secret,
        ),
        signOptions: {
          expiresIn: configService.get(
            'jwt.expiresIn',
            configuration().jwt.expiresIn,
          ) as any,
        },
      }),
    }),
    SessionFeatureModule,
    DatabaseModule,
  ],
  providers: [JwtStrategy, PermissionService, PermissionsGuard],
  exports: [JwtModule, PassportModule, PermissionService, PermissionsGuard],
})
export class AuthModule {}

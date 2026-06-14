import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { CurrentUser } from '../../core/auth/current-user.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Get('captcha')
  @ApiOperation({ summary: '获取验证码' })
  getCaptcha() {
    return this.captchaService.generate();
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] ?? null;
    return this.authService.login(dto, { ip, userAgent });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiUnauthorizedResponse({ description: '未授权' })
  profile(@CurrentUser() user: { id: string }) {
    return this.authService.profile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改当前用户信息' })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  @Get('menus')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户菜单树' })
  getUserMenus(@CurrentUser() user: { id: string }) {
    return this.authService.getUserMenus(user.id);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新令牌' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}

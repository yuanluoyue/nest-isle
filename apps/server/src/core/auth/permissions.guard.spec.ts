import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from './permissions.decorator';

function createMockContext(
  userPermissions: string[],
  handler: any = jest.fn(),
  classRef: any = jest.fn(),
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: () => ({
      getRequest: () => ({ user: { permissions: userPermissions } }),
    }),
  } as any;
}

describe('PermissionsGuard', () => {
  let reflector: jest.Mocked<Reflector>;
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new PermissionsGuard(reflector);
  });

  it('未标记 @RequirePermission 时直接放行', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext([]);

    expect(guard.canActivate(ctx)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(PERMISSIONS_KEY, [
      expect.any(Function),
      expect.any(Function),
    ]);
  });

  it('标记为空数组时直接放行', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const ctx = createMockContext([]);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('用户拥有任一所需权限即放行', () => {
    reflector.getAllAndOverride.mockReturnValue([
      'system:user:create',
      'system:user:export',
    ]);
    const ctx = createMockContext(['system:user:export']);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('用户不拥有任何所需权限时抛 ForbiddenException', () => {
    reflector.getAllAndOverride.mockReturnValue(['system:user:delete']);
    const ctx = createMockContext(['system:user:read']);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('request.user 不存在时按空权限处理', () => {
    reflector.getAllAndOverride.mockReturnValue(['system:user:delete']);
    const ctx: ExecutionContext = {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as any;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

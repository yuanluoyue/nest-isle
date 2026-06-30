import { Injectable } from '@nestjs/common';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import { sysUserRole, sysRoleMenu, sysMenu } from '../../database/schema';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class PermissionService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  /**
   * 获取用户所有权限标识集合
   */
  async getPermissions(userId: string): Promise<string[]> {
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
      ),
      columns: {
        permission: true,
      },
    });

    return menus.map((m) => m.permission).filter((p): p is string => !!p);
  }
}

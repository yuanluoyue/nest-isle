import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { eq, and, isNull, ilike, SQL } from 'drizzle-orm';
import { sysRole, sysRoleMenu, sysMenu } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RoleService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryRoleDto) {
    const { page = 1, pageSize = 10, name, code, status } = query;
    const offset = (page - 1) * pageSize;

    const conditions: SQL[] = [isNull(sysRole.deletedAt)];
    if (name) conditions.push(ilike(sysRole.name, `%${name}%`));
    if (code) conditions.push(ilike(sysRole.code, `%${code}%`));
    if (status !== undefined) conditions.push(eq(sysRole.status, status));

    const where = and(...conditions);

    const [roles, countResult] = await Promise.all([
      this.db.query.sysRole.findMany({
        where,
        limit: pageSize,
        offset,
        columns: {
          id: true,
          name: true,
          code: true,
          sort: true,
          status: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.select({ id: sysRole.id }).from(sysRole).where(where),
    ]);

    return {
      list: roles,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const role = await this.db.query.sysRole.findFirst({
      where: and(eq(sysRole.id, id), isNull(sysRole.deletedAt)),
      columns: {
        id: true,
        name: true,
        code: true,
        sort: true,
        status: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 查询角色关联的菜单ID
    const roleMenus = await this.db.query.sysRoleMenu.findMany({
      where: eq(sysRoleMenu.roleId, role.id),
    });

    return {
      ...role,
      menuIds: roleMenus.map((rm) => rm.menuId),
    };
  }

  async create(dto: CreateRoleDto) {
    const existing = await this.db.query.sysRole.findFirst({
      where: eq(sysRole.code, dto.code),
    });
    if (existing) {
      throw new ConflictException('角色编码已存在');
    }

    const [role] = await this.db.insert(sysRole).values({
      name: dto.name,
      code: dto.code,
      sort: dto.sort,
      status: dto.status ?? 0,
      remark: dto.remark,
    }).returning({
      id: sysRole.id,
      name: sysRole.name,
      code: sysRole.code,
      sort: sysRole.sort,
      status: sysRole.status,
      remark: sysRole.remark,
      createdAt: sysRole.createdAt,
      updatedAt: sysRole.updatedAt,
    });

    return role;
  }

  async update(id: string, dto: UpdateRoleDto) {
    const role = await this.db.query.sysRole.findFirst({
      where: and(eq(sysRole.id, id), isNull(sysRole.deletedAt)),
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (role.code === 'admin') {
      throw new ForbiddenException('超级管理员角色不允许修改');
    }

    // 如果修改了 code，检查唯一性
    if (dto.code && dto.code !== role.code) {
      const existing = await this.db.query.sysRole.findFirst({
        where: eq(sysRole.code, dto.code),
      });
      if (existing) {
        throw new ConflictException('角色编码已存在');
      }
    }

    const updateData: Record<string, any> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.sort !== undefined) updateData.sort = dto.sort;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await this.db.update(sysRole).set(updateData).where(eq(sysRole.id, id)).returning({
      id: sysRole.id,
      name: sysRole.name,
      code: sysRole.code,
      sort: sysRole.sort,
      status: sysRole.status,
      remark: sysRole.remark,
      createdAt: sysRole.createdAt,
      updatedAt: sysRole.updatedAt,
    });

    return updated;
  }

  async remove(id: string) {
    const role = await this.db.query.sysRole.findFirst({
      where: and(eq(sysRole.id, id), isNull(sysRole.deletedAt)),
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    if (role.code === 'admin') {
      throw new ForbiddenException('超级管理员角色不允许删除');
    }

    // 软删除
    await this.db.update(sysRole).set({ deletedAt: new Date() }).where(eq(sysRole.id, id));
  }

  async assignMenus(roleId: string, menuIds: string[]) {
    const role = await this.db.query.sysRole.findFirst({
      where: and(eq(sysRole.id, roleId), isNull(sysRole.deletedAt)),
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 先删除旧的关联
    await this.db.delete(sysRoleMenu).where(eq(sysRoleMenu.roleId, roleId));

    // 再批量插入新的关联
    if (menuIds.length > 0) {
      await this.db.insert(sysRoleMenu).values(
        menuIds.map((menuId) => ({
          roleId,
          menuId,
        })),
      );
    }

    return this.findOne(roleId);
  }

  async getMenuTree() {
    const menus = await this.db.query.sysMenu.findMany({
      where: isNull(sysMenu.deletedAt),
      columns: {
        id: true,
        parentId: true,
        name: true,
        type: true,
        path: true,
        permission: true,
        icon: true,
        sort: true,
        visible: true,
        status: true,
      },
    });
    return menus;
  }
}

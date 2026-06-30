import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, isNull, ilike, asc, SQL } from 'drizzle-orm';
import { sysMenu } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { QueryMenuDto } from './dto/query-menu.dto';
import { buildMenuTree } from '../../auth/menu-tree.util';

@Injectable()
export class MenuService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryMenuDto) {
    const conditions: SQL[] = [isNull(sysMenu.deletedAt)];
    if (query.name) conditions.push(ilike(sysMenu.name, `%${query.name}%`));
    if (query.type !== undefined) conditions.push(eq(sysMenu.type, query.type));
    if (query.status !== undefined)
      conditions.push(eq(sysMenu.status, query.status));

    const where = and(...conditions);

    const menus = await this.db.query.sysMenu.findMany({
      where,
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: asc(sysMenu.sort),
    });

    // 构建树形结构
    return buildMenuTree(menus);
  }

  async findOne(id: string) {
    const menu = await this.db.query.sysMenu.findFirst({
      where: and(eq(sysMenu.id, id), isNull(sysMenu.deletedAt)),
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async create(dto: CreateMenuDto) {
    // 权限标识唯一性校验
    if (dto.permission) {
      const existing = await this.db.query.sysMenu.findFirst({
        where: and(
          eq(sysMenu.permission, dto.permission),
          isNull(sysMenu.deletedAt),
        ),
      });
      if (existing) {
        throw new ConflictException('权限标识已存在');
      }
    }

    const [menu] = await this.db
      .insert(sysMenu)
      .values({
        parentId: dto.parentId || null,
        name: dto.name,
        type: dto.type,
        path: dto.path,
        component: dto.component,
        permission: dto.permission,
        icon: dto.icon,
        sort: dto.sort ?? 0,
        visible: dto.visible ?? 0,
        status: dto.status ?? 0,
      })
      .returning();

    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    const menu = await this.db.query.sysMenu.findFirst({
      where: and(eq(sysMenu.id, id), isNull(sysMenu.deletedAt)),
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 不能把自己设为父级
    if (dto.parentId === id) {
      throw new ConflictException('不能将自己设为父级');
    }

    // 权限标识唯一性校验
    if (dto.permission && dto.permission !== menu.permission) {
      const existing = await this.db.query.sysMenu.findFirst({
        where: and(
          eq(sysMenu.permission, dto.permission),
          isNull(sysMenu.deletedAt),
        ),
      });
      if (existing) {
        throw new ConflictException('权限标识已存在');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.parentId !== undefined) updateData.parentId = dto.parentId || null;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.path !== undefined) updateData.path = dto.path;
    if (dto.component !== undefined) updateData.component = dto.component;
    if (dto.permission !== undefined) updateData.permission = dto.permission;
    if (dto.icon !== undefined) updateData.icon = dto.icon;
    if (dto.sort !== undefined) updateData.sort = dto.sort;
    if (dto.visible !== undefined) updateData.visible = dto.visible;
    if (dto.status !== undefined) updateData.status = dto.status;

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await this.db
      .update(sysMenu)
      .set(updateData)
      .where(eq(sysMenu.id, id))
      .returning();
    return updated;
  }

  async remove(id: string) {
    const menu = await this.db.query.sysMenu.findFirst({
      where: and(eq(sysMenu.id, id), isNull(sysMenu.deletedAt)),
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    const children = await this.db.query.sysMenu.findMany({
      where: and(eq(sysMenu.parentId, id), isNull(sysMenu.deletedAt)),
    });
    if (children.length > 0) {
      throw new ConflictException('存在子菜单，不允许删除');
    }

    // 软删除
    await this.db
      .update(sysMenu)
      .set({ deletedAt: new Date() })
      .where(eq(sysMenu.id, id));
  }
}

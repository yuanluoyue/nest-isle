import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { eq, like, and, isNull, ilike } from 'drizzle-orm';
import { sysUser, sysUserRole, sysRole } from '../../../database/schema';
import { DatabaseService } from '../../../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ResetPasswordDto } from './dto/password.dto';
import { hashSync, compareSync } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.db;
  }

  async findAll(query: QueryUserDto) {
    const {
      page = 1,
      pageSize = 10,
      username,
      nickname,
      phone,
      status,
    } = query;
    const offset = (page - 1) * pageSize;

    const conditions = [isNull(sysUser.deletedAt)];
    if (username) conditions.push(ilike(sysUser.username, `%${username}%`));
    if (nickname) conditions.push(ilike(sysUser.nickname, `%${nickname}%`));
    if (phone) conditions.push(ilike(sysUser.phone, `%${phone}%`));
    if (status !== undefined) conditions.push(eq(sysUser.status, status));

    const where = and(...conditions);

    const [users, countResult] = await Promise.all([
      this.db.query.sysUser.findMany({
        where,
        limit: pageSize,
        offset,
        columns: {
          id: true,
          username: true,
          nickname: true,
          email: true,
          phone: true,
          gender: true,
          avatar: true,
          deptId: true,
          status: true,
          remark: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.select({ id: sysUser.id }).from(sysUser).where(where),
    ]);

    // 查询每个用户的角色
    const usersWithRoles = await Promise.all(
      users.map(async (user) => {
        const userRoles = await this.db.query.sysUserRole.findMany({
          where: eq(sysUserRole.userId, user.id),
          with: { role: true },
        });
        return {
          ...user,
          roles: userRoles
            .map((ur) =>
              ur.role
                ? { id: ur.role.id, name: ur.role.name, code: ur.role.code }
                : null,
            )
            .filter(Boolean),
        };
      }),
    );

    return {
      list: usersWithRoles,
      total: countResult.length,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, id), isNull(sysUser.deletedAt)),
      columns: {
        id: true,
        username: true,
        nickname: true,
        email: true,
        phone: true,
        gender: true,
        avatar: true,
        deptId: true,
        status: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const userRoles = await this.db.query.sysUserRole.findMany({
      where: eq(sysUserRole.userId, user.id),
      with: { role: true },
    });

    return {
      ...user,
      roles: userRoles
        .map((ur) =>
          ur.role
            ? { id: ur.role.id, name: ur.role.name, code: ur.role.code }
            : null,
        )
        .filter(Boolean),
    };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.db.query.sysUser.findFirst({
      where: eq(sysUser.username, dto.username),
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const [user] = await this.db
      .insert(sysUser)
      .values({
        username: dto.username,
        password: hashSync(dto.password, 10),
        nickname: dto.nickname,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender,
        deptId: dto.deptId,
        status: dto.status ?? 0,
        remark: dto.remark,
      })
      .returning({
        id: sysUser.id,
        username: sysUser.username,
        nickname: sysUser.nickname,
        email: sysUser.email,
        phone: sysUser.phone,
        gender: sysUser.gender,
        avatar: sysUser.avatar,
        deptId: sysUser.deptId,
        status: sysUser.status,
        remark: sysUser.remark,
        createdAt: sysUser.createdAt,
        updatedAt: sysUser.updatedAt,
      });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, id), isNull(sysUser.deletedAt)),
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updateData: Record<string, any> = {};
    if (dto.username !== undefined) updateData.username = dto.username;
    if (dto.nickname !== undefined) updateData.nickname = dto.nickname;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.deptId !== undefined) updateData.deptId = dto.deptId;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.remark !== undefined) updateData.remark = dto.remark;

    if (Object.keys(updateData).length === 0) {
      return this.findOne(id);
    }

    const [updated] = await this.db
      .update(sysUser)
      .set(updateData)
      .where(eq(sysUser.id, id))
      .returning({
        id: sysUser.id,
        username: sysUser.username,
        nickname: sysUser.nickname,
        email: sysUser.email,
        phone: sysUser.phone,
        gender: sysUser.gender,
        avatar: sysUser.avatar,
        deptId: sysUser.deptId,
        status: sysUser.status,
        remark: sysUser.remark,
        createdAt: sysUser.createdAt,
        updatedAt: sysUser.updatedAt,
      });

    return updated;
  }

  async remove(id: string) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, id), isNull(sysUser.deletedAt)),
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.username === 'admin') {
      throw new ForbiddenException('超级管理员不允许删除');
    }

    // 软删除
    await this.db
      .update(sysUser)
      .set({ deletedAt: new Date() })
      .where(eq(sysUser.id, id));
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, id), isNull(sysUser.deletedAt)),
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await this.db
      .update(sysUser)
      .set({ password: hashSync(dto.newPassword, 10) })
      .where(eq(sysUser.id, id));
  }

  async updatePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, id), isNull(sysUser.deletedAt)),
    });
    if (!user || !user.password || !compareSync(oldPassword, user.password)) {
      throw new BadRequestException('旧密码错误');
    }

    await this.db
      .update(sysUser)
      .set({ password: hashSync(newPassword, 10) })
      .where(eq(sysUser.id, id));
  }

  async assignRoles(userId: string, roleIds: string[]) {
    const user = await this.db.query.sysUser.findFirst({
      where: and(eq(sysUser.id, userId), isNull(sysUser.deletedAt)),
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 先删除旧的关联
    await this.db.delete(sysUserRole).where(eq(sysUserRole.userId, userId));

    // 再批量插入新的关联
    if (roleIds.length > 0) {
      await this.db
        .insert(sysUserRole)
        .values(roleIds.map((roleId) => ({ userId, roleId })));
    }

    return this.findOne(userId);
  }
}

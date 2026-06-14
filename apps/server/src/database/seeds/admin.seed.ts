import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';
import { hashSync } from 'bcryptjs';

const connectionString = `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? 'nest_isle'}`;

async function seed() {
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  // 幂等：查找或创建部门
  let dept = await db.query.sysDept.findFirst({ where: eq(schema.sysDept.name, '总公司') });
  if (!dept) {
    const [created] = await db.insert(schema.sysDept).values({
      name: '总公司',
      sort: 0,
      status: 0,
    }).returning();
    dept = created;
    console.log('Created dept: 总公司');
  }

  // 幂等：查找或创建角色
  let role = await db.query.sysRole.findFirst({ where: eq(schema.sysRole.code, 'admin') });
  if (!role) {
    const [created] = await db.insert(schema.sysRole).values({
      name: '超级管理员',
      code: 'admin',
      sort: 0,
      status: 0,
    }).returning();
    role = created;
    console.log('Created role: admin');
  }

  // 幂等：查找或创建管理员账号
  let admin = await db.query.sysUser.findFirst({ where: eq(schema.sysUser.username, 'admin') });
  if (!admin) {
    const [created] = await db.insert(schema.sysUser).values({
      username: 'admin',
      password: hashSync('123456', 10),
      nickname: '超级管理员',
      gender: 0,
      deptId: dept.id,
      status: 0,
    }).returning();
    admin = created;
    console.log('Created user: admin');
  }

  // 幂等：查找或创建用户角色关联
  const existingRelation = await db.query.sysUserRole.findFirst({
    where: (t, { and }) => and(eq(t.userId, admin.id), eq(t.roleId, role.id)),
  });
  if (!existingRelation) {
    await db.insert(schema.sysUserRole).values({
      userId: admin.id,
      roleId: role.id,
    });
    console.log('Created user-role relation');
  }

  // ============ 菜单和权限 ============

  // 仪表盘菜单
  let dashboardMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '仪表盘') });
  if (!dashboardMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      name: '仪表盘',
      type: 1,
      path: '/dashboard',
      component: 'dashboard',
      permission: 'dashboard:view',
      icon: 'DashboardOutlined',
      sort: 0,
      visible: 0,
      status: 0,
    }).returning();
    dashboardMenu = created;
    console.log('Created menu: 仪表盘');
  }

  // 系统管理目录
  let systemMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '系统管理') });
  if (!systemMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      name: '系统管理',
      type: 0,
      path: '/system',
      icon: 'SettingOutlined',
      sort: 1,
      visible: 0,
      status: 0,
    }).returning();
    systemMenu = created;
    console.log('Created menu: 系统管理');
  }

  // 用户管理菜单
  let userMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '用户管理') });
  if (!userMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      parentId: systemMenu.id,
      name: '用户管理',
      type: 1,
      path: '/system/user',
      component: 'system/user',
      permission: 'system:user:list',
      icon: 'UserOutlined',
      sort: 1,
      visible: 0,
      status: 0,
    }).returning();
    userMenu = created;
    console.log('Created menu: 用户管理');
  }

  // 用户管理按钮权限
  const userButtons = [
    { name: '用户新增', permission: 'system:user:create', sort: 1 },
    { name: '用户编辑', permission: 'system:user:update', sort: 2 },
    { name: '用户删除', permission: 'system:user:delete', sort: 3 },
    { name: '重置密码', permission: 'system:user:reset-password', sort: 4 },
  ];

  for (const btn of userButtons) {
    const existing = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.permission, btn.permission) });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: userMenu.id,
        name: btn.name,
        type: 2,
        permission: btn.permission,
        sort: btn.sort,
        visible: 0,
        status: 0,
      });
      console.log(`Created button: ${btn.name}`);
    }
  }

  // 角色管理菜单
  let roleMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '角色管理') });
  if (!roleMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      parentId: systemMenu.id,
      name: '角色管理',
      type: 1,
      path: '/system/role',
      component: 'system/role',
      permission: 'system:role:list',
      icon: 'TeamOutlined',
      sort: 2,
      visible: 0,
      status: 0,
    }).returning();
    roleMenu = created;
    console.log('Created menu: 角色管理');
  }

  // 角色管理按钮权限
  const roleButtons = [
    { name: '角色新增', permission: 'system:role:create', sort: 1 },
    { name: '角色编辑', permission: 'system:role:update', sort: 2 },
    { name: '角色删除', permission: 'system:role:delete', sort: 3 },
    { name: '分配权限', permission: 'system:role:assign', sort: 4 },
  ];

  for (const btn of roleButtons) {
    const existing = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.permission, btn.permission) });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: roleMenu.id,
        name: btn.name,
        type: 2,
        permission: btn.permission,
        sort: btn.sort,
        visible: 0,
        status: 0,
      });
      console.log(`Created button: ${btn.name}`);
    }
  }

  // 菜单管理菜单
  let menuManageMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '菜单管理') });
  if (!menuManageMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      parentId: systemMenu.id,
      name: '菜单管理',
      type: 1,
      path: '/system/menu',
      component: 'system/menu',
      permission: 'system:menu:list',
      icon: 'MenuOutlined',
      sort: 3,
      visible: 0,
      status: 0,
    }).returning();
    menuManageMenu = created;
    console.log('Created menu: 菜单管理');
  }

  // 菜单管理按钮权限
  const menuButtons = [
    { name: '菜单新增', permission: 'system:menu:create', sort: 1 },
    { name: '菜单编辑', permission: 'system:menu:update', sort: 2 },
    { name: '菜单删除', permission: 'system:menu:delete', sort: 3 },
  ];

  for (const btn of menuButtons) {
    const existing = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.permission, btn.permission) });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: menuManageMenu.id,
        name: btn.name,
        type: 2,
        permission: btn.permission,
        sort: btn.sort,
        visible: 0,
        status: 0,
      });
      console.log(`Created button: ${btn.name}`);
    }
  }

  // 系统监控目录
  let monitorMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '系统监控') });
  if (!monitorMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      name: '系统监控',
      type: 0,
      path: '/monitor',
      icon: 'MonitorOutlined',
      sort: 2,
      visible: 0,
      status: 0,
    }).returning();
    monitorMenu = created;
    console.log('Created menu: 系统监控');
  }

  // 操作日志菜单
  let operateLogMenu = await db.query.sysMenu.findFirst({ where: eq(schema.sysMenu.name, '操作日志') });
  if (!operateLogMenu) {
    const [created] = await db.insert(schema.sysMenu).values({
      parentId: monitorMenu.id,
      name: '操作日志',
      type: 1,
      path: '/monitor/operate-log',
      component: 'monitor/operate-log',
      permission: 'monitor:operate-log:list',
      icon: 'FileTextOutlined',
      sort: 1,
      visible: 0,
      status: 0,
    }).returning();
    operateLogMenu = created;
    console.log('Created menu: 操作日志');
  }

  // 给 admin 角色分配菜单权限
  const menus = await db.query.sysMenu.findMany();
  for (const menu of menus) {
    const existing = await db.query.sysRoleMenu.findFirst({
      where: (t, { and }) => and(eq(t.roleId, role.id), eq(t.menuId, menu.id)),
    });
    if (!existing) {
      await db.insert(schema.sysRoleMenu).values({
        roleId: role.id,
        menuId: menu.id,
      });
    }
  }
  console.log('Synced role-menu relations');

  console.log('Seed completed');
  await client.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

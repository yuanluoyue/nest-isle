import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';
import { eq } from 'drizzle-orm';
import { hashSync } from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载 server 目录下的 .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const APP_NAME = process.env.APP_NAME ?? 'nest-isle';
const toSnakeCase = (s: string) => s.replace(/-/g, '_');

const connectionString = `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'postgres'}@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432}/${process.env.DB_NAME ?? toSnakeCase(APP_NAME)}`;

async function seed() {
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  // 幂等：查找或创建部门
  let dept = await db.query.sysDept.findFirst({
    where: eq(schema.sysDept.name, '总公司'),
  });
  if (!dept) {
    const [created] = await db
      .insert(schema.sysDept)
      .values({
        name: '总公司',
        sort: 0,
        status: 0,
      })
      .returning();
    dept = created;
    console.log('Created dept: 总公司');
  }

  // 幂等：查找或创建角色
  let role = await db.query.sysRole.findFirst({
    where: eq(schema.sysRole.code, 'admin'),
  });
  if (!role) {
    const [created] = await db
      .insert(schema.sysRole)
      .values({
        name: '超级管理员',
        code: 'admin',
        sort: 0,
        status: 0,
      })
      .returning();
    role = created;
    console.log('Created role: admin');
  }

  // 幂等：查找或创建管理员账号
  let admin = await db.query.sysUser.findFirst({
    where: eq(schema.sysUser.username, 'admin'),
  });
  if (!admin) {
    const [created] = await db
      .insert(schema.sysUser)
      .values({
        username: 'admin',
        password: hashSync('123456', 10),
        nickname: '超级管理员',
        gender: 0,
        deptId: dept.id,
        status: 0,
      })
      .returning();
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
  let dashboardMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '仪表盘'),
  });
  if (!dashboardMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        name: '仪表盘',
        type: 1,
        path: '/dashboard',
        component: 'dashboard',
        permission: 'dashboard:view',
        icon: 'DashboardOutlined',
        sort: 0,
        visible: 0,
        status: 0,
      })
      .returning();
    dashboardMenu = created;
    console.log('Created menu: 仪表盘');
  }

  // 系统管理目录
  let systemMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '系统管理'),
  });
  if (!systemMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        name: '系统管理',
        type: 0,
        path: '/system',
        icon: 'SettingOutlined',
        sort: 1,
        visible: 0,
        status: 0,
      })
      .returning();
    systemMenu = created;
    console.log('Created menu: 系统管理');
  }

  // 用户管理菜单
  let userMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '用户管理'),
  });
  if (!userMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
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
      })
      .returning();
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
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
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
  let roleMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '角色管理'),
  });
  if (!roleMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
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
      })
      .returning();
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
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
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
  let menuManageMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '菜单管理'),
  });
  if (!menuManageMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
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
      })
      .returning();
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
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
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

  // 字典管理菜单
  let dictMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '字典管理'),
  });
  if (!dictMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: systemMenu.id,
        name: '字典管理',
        type: 1,
        path: '/system/dict',
        component: 'system/dict',
        permission: 'system:dict:list',
        icon: 'BookOutlined',
        sort: 4,
        visible: 0,
        status: 0,
      })
      .returning();
    dictMenu = created;
    console.log('Created menu: 字典管理');
  }

  // 字典管理按钮权限
  const dictButtons = [
    { name: '字典类型新增', permission: 'system:dict:type:create', sort: 1 },
    { name: '字典类型编辑', permission: 'system:dict:type:update', sort: 2 },
    { name: '字典类型删除', permission: 'system:dict:type:delete', sort: 3 },
    { name: '字典项新增', permission: 'system:dict:item:create', sort: 4 },
    { name: '字典项编辑', permission: 'system:dict:item:update', sort: 5 },
    { name: '字典项删除', permission: 'system:dict:item:delete', sort: 6 },
  ];

  for (const btn of dictButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: dictMenu.id,
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

  // 通知公告菜单
  let noticeMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '通知公告'),
  });
  if (!noticeMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: systemMenu.id,
        name: '通知公告',
        type: 1,
        path: '/system/notice',
        component: 'system/notice',
        permission: 'system:notice:list',
        icon: 'NotificationOutlined',
        sort: 5,
        visible: 0,
        status: 0,
      })
      .returning();
    noticeMenu = created;
    console.log('Created menu: 通知公告');
  }

  // 通知公告按钮权限
  const noticeButtons = [
    { name: '通知新增', permission: 'system:notice:create', sort: 1 },
    { name: '通知编辑', permission: 'system:notice:update', sort: 2 },
    { name: '通知删除', permission: 'system:notice:delete', sort: 3 },
  ];

  for (const btn of noticeButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: noticeMenu.id,
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

  // 系统配置菜单
  let configMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '系统配置'),
  });
  if (!configMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: systemMenu.id,
        name: '系统配置',
        type: 1,
        path: '/system/config',
        component: 'system/config',
        permission: 'system:config:list',
        icon: 'SettingFilled',
        sort: 6,
        visible: 0,
        status: 0,
      })
      .returning();
    configMenu = created;
    console.log('Created menu: 系统配置');
  }

  // 系统配置按钮权限
  const configButtons = [
    { name: '配置新增', permission: 'system:config:create', sort: 1 },
    { name: '配置编辑', permission: 'system:config:update', sort: 2 },
    { name: '配置删除', permission: 'system:config:delete', sort: 3 },
    { name: '刷新缓存', permission: 'system:config:refresh-cache', sort: 4 },
  ];

  for (const btn of configButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: configMenu.id,
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
  let monitorMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '系统监控'),
  });
  if (!monitorMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        name: '系统监控',
        type: 0,
        path: '/monitor',
        icon: 'MonitorOutlined',
        sort: 2,
        visible: 0,
        status: 0,
      })
      .returning();
    monitorMenu = created;
    console.log('Created menu: 系统监控');
  }

  // 操作日志菜单
  let operateLogMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '操作日志'),
  });
  if (!operateLogMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
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
      })
      .returning();
    operateLogMenu = created;
    console.log('Created menu: 操作日志');
  }

  // 登录日志菜单
  let loginLogMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '登录日志'),
  });
  if (!loginLogMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: monitorMenu.id,
        name: '登录日志',
        type: 1,
        path: '/monitor/login-log',
        component: 'monitor/login-log',
        permission: 'monitor:login-log:list',
        icon: 'FileTextOutlined',
        sort: 2,
        visible: 0,
        status: 0,
      })
      .returning();
    loginLogMenu = created;
    console.log('Created menu: 登录日志');
  }

  // 定时任务菜单
  let jobMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '定时任务'),
  });
  if (!jobMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: monitorMenu.id,
        name: '定时任务',
        type: 1,
        path: '/monitor/job',
        component: 'monitor/job',
        permission: 'monitor:job:list',
        icon: 'ScheduleOutlined',
        sort: 3,
        visible: 0,
        status: 0,
      })
      .returning();
    jobMenu = created;
    console.log('Created menu: 定时任务');
  }

  // 定时任务按钮权限
  const jobButtons = [
    { name: '任务新增', permission: 'monitor:job:create', sort: 1 },
    { name: '任务编辑', permission: 'monitor:job:update', sort: 2 },
    { name: '任务删除', permission: 'monitor:job:delete', sort: 3 },
    { name: '任务启动', permission: 'monitor:job:start', sort: 4 },
    { name: '任务停止', permission: 'monitor:job:stop', sort: 5 },
    { name: '立即执行', permission: 'monitor:job:run', sort: 6 },
  ];

  for (const btn of jobButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: jobMenu.id,
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

  // 会话管理菜单
  let sessionMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '会话管理'),
  });
  if (!sessionMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: monitorMenu.id,
        name: '会话管理',
        type: 1,
        path: '/monitor/session',
        component: 'monitor/session',
        permission: 'monitor:session:list',
        icon: 'OnlineOutlined',
        sort: 4,
        visible: 0,
        status: 0,
      })
      .returning();
    sessionMenu = created;
    console.log('Created menu: 会话管理');
  }

  // 会话管理按钮权限
  const sessionButtons = [
    { name: '强制下线', permission: 'monitor:session:force-logout', sort: 1 },
  ];

  for (const btn of sessionButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: sessionMenu.id,
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

  // AI 能力目录
  let aiMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, 'AI 能力'),
  });
  if (!aiMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        name: 'AI 能力',
        type: 0,
        path: '/ai',
        icon: 'RobotOutlined',
        sort: 3,
        visible: 0,
        status: 0,
      })
      .returning();
    aiMenu = created;
    console.log('Created menu: AI 能力');
  }

  // Provider 管理菜单
  let aiProviderMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, 'Provider 管理'),
  });
  if (!aiProviderMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: aiMenu.id,
        name: 'Provider 管理',
        type: 1,
        path: '/ai/provider',
        component: 'ai/provider',
        permission: 'ai:provider:list',
        icon: 'ApiOutlined',
        sort: 1,
        visible: 0,
        status: 0,
      })
      .returning();
    aiProviderMenu = created;
    console.log('Created menu: Provider 管理');
  }

  // Provider 管理按钮权限
  const aiProviderButtons = [
    { name: 'Provider 新增', permission: 'ai:provider:create', sort: 1 },
    { name: 'Provider 编辑', permission: 'ai:provider:update', sort: 2 },
    { name: 'Provider 删除', permission: 'ai:provider:delete', sort: 3 },
    { name: '测试连接', permission: 'ai:provider:test', sort: 4 },
  ];

  for (const btn of aiProviderButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: aiProviderMenu.id,
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

  // Model 管理菜单
  let aiModelMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, 'Model 管理'),
  });
  if (!aiModelMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: aiMenu.id,
        name: 'Model 管理',
        type: 1,
        path: '/ai/model',
        component: 'ai/model',
        permission: 'ai:model:list',
        icon: 'ExperimentOutlined',
        sort: 2,
        visible: 0,
        status: 0,
      })
      .returning();
    aiModelMenu = created;
    console.log('Created menu: Model 管理');
  }

  // Model 管理按钮权限
  const aiModelButtons = [
    { name: 'Model 新增', permission: 'ai:model:create', sort: 1 },
    { name: 'Model 编辑', permission: 'ai:model:update', sort: 2 },
    { name: 'Model 删除', permission: 'ai:model:delete', sort: 3 },
  ];

  for (const btn of aiModelButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: aiModelMenu.id,
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

  // Playground 菜单
  let aiPlaygroundMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, 'Playground'),
  });
  if (!aiPlaygroundMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: aiMenu.id,
        name: 'Playground',
        type: 1,
        path: '/ai/playground',
        component: 'ai/playground',
        permission: 'ai:playground:view',
        icon: 'CodeOutlined',
        sort: 3,
        visible: 0,
        status: 0,
      })
      .returning();
    aiPlaygroundMenu = created;
    console.log('Created menu: Playground');
  }

  // Prompt 管理菜单
  let aiPromptMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, 'Prompt 管理'),
  });
  if (!aiPromptMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: aiMenu.id,
        name: 'Prompt 管理',
        type: 1,
        path: '/ai/prompt',
        component: 'ai/prompt',
        permission: 'ai:prompt:list',
        icon: 'FormOutlined',
        sort: 4,
        visible: 0,
        status: 0,
      })
      .returning();
    aiPromptMenu = created;
    console.log('Created menu: Prompt 管理');
  }

  // Prompt 管理按钮权限
  const aiPromptButtons = [
    { name: 'Prompt 新增', permission: 'ai:prompt:create', sort: 1 },
    { name: 'Prompt 编辑', permission: 'ai:prompt:update', sort: 2 },
    { name: 'Prompt 删除', permission: 'ai:prompt:delete', sort: 3 },
  ];

  for (const btn of aiPromptButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: aiPromptMenu.id,
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

  // 调用日志菜单
  let aiLogMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '调用日志'),
  });
  if (!aiLogMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: aiMenu.id,
        name: '调用日志',
        type: 1,
        path: '/ai/log',
        component: 'ai/log',
        permission: 'ai:log:list',
        icon: 'FileTextOutlined',
        sort: 5,
        visible: 0,
        status: 0,
      })
      .returning();
    aiLogMenu = created;
    console.log('Created menu: 调用日志');
  }

  // 表单管理目录
  let formMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '表单管理'),
  });
  if (!formMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        name: '表单管理',
        type: 0,
        path: '/form',
        icon: 'FormOutlined',
        sort: 4,
        visible: 0,
        status: 0,
      })
      .returning();
    formMenu = created;
    console.log('Created menu: 表单管理');
  }

  // 表单设计菜单（合并列表+设计+预览+发布）
  let formDesignMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '表单设计'),
  });
  if (!formDesignMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: formMenu.id,
        name: '表单设计',
        type: 1,
        path: '/form/design',
        component: 'form/design',
        permission: 'form:design:list',
        icon: 'EditOutlined',
        sort: 1,
        visible: 0,
        status: 0,
      })
      .returning();
    formDesignMenu = created;
    console.log('Created menu: 表单设计');
  }

  // 表单设计按钮权限
  const formDesignButtons = [
    { name: '表单新增', permission: 'form:design:create', sort: 1 },
    { name: '表单编辑', permission: 'form:design:update', sort: 2 },
    { name: '表单删除', permission: 'form:design:delete', sort: 3 },
    { name: '表单发布', permission: 'form:design:publish', sort: 4 },
    { name: '表单停用', permission: 'form:design:unpublish', sort: 5 },
  ];

  for (const btn of formDesignButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: formDesignMenu.id,
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

  // 表单数据菜单
  let formRecordMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '表单数据'),
  });
  if (!formRecordMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: formMenu.id,
        name: '表单数据',
        type: 1,
        path: '/form/record',
        component: 'form/record',
        permission: 'form:record:list',
        icon: 'TableOutlined',
        sort: 2,
        visible: 0,
        status: 0,
      })
      .returning();
    formRecordMenu = created;
    console.log('Created menu: 表单数据');
  }

  // 表单数据按钮权限
  const formRecordButtons = [
    { name: '数据提交', permission: 'form:record:create', sort: 1 },
    { name: '数据删除', permission: 'form:record:delete', sort: 2 },
  ];

  for (const btn of formRecordButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: formRecordMenu.id,
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

  // 数据源管理菜单
  let formDatasourceMenu = await db.query.sysMenu.findFirst({
    where: eq(schema.sysMenu.name, '数据源管理'),
  });
  if (!formDatasourceMenu) {
    const [created] = await db
      .insert(schema.sysMenu)
      .values({
        parentId: formMenu.id,
        name: '数据源管理',
        type: 1,
        path: '/form/datasource',
        component: 'form/datasource',
        permission: 'form:datasource:list',
        icon: 'DatabaseOutlined',
        sort: 3,
        visible: 0,
        status: 0,
      })
      .returning();
    formDatasourceMenu = created;
    console.log('Created menu: 数据源管理');
  }

  // 数据源管理按钮权限
  const formDatasourceButtons = [
    { name: '数据源新增', permission: 'form:datasource:create', sort: 1 },
    { name: '数据源编辑', permission: 'form:datasource:update', sort: 2 },
    { name: '数据源删除', permission: 'form:datasource:delete', sort: 3 },
  ];

  for (const btn of formDatasourceButtons) {
    const existing = await db.query.sysMenu.findFirst({
      where: eq(schema.sysMenu.permission, btn.permission),
    });
    if (!existing) {
      await db.insert(schema.sysMenu).values({
        parentId: formDatasourceMenu.id,
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

  // ============ AI Prompt 数据 ============
  const aiPrompts = [
    {
      code: 'form_schema_generator',
      name: '表单 Schema 生成器',
      content: `你是一个表单设计专家，擅长根据用户需求生成 form-render 格式的 JSON Schema。

请根据用户的需求描述，生成一个符合 form-render 规范的表单 Schema。

Schema 格式要求：
1. 根节点必须是 { "type": "object", "properties": {...} }
2. 每个字段需要包含 type、title 属性
3. 字符串类型字段可加 placeholder 属性作为占位提示
4. 数字类型字段 type 为 "number"
5. 布尔类型字段 type 为 "boolean"
6. 选择类字段（单选/多选）使用 enum 和 enumNames 属性
   - enum: 选项值数组
   - enumNames: 选项标签数组
7. 日期字段格式为 { "type": "string", "format": "date" }
8. 多行文本使用 { "type": "string", "format": "textarea" }
9. 如需必填，添加 required 数组到根节点，包含必填字段的 key

示例 Schema：
{
  "type": "object",
  "properties": {
    "name": {
      "title": "姓名",
      "type": "string",
      "placeholder": "请输入姓名"
    },
    "gender": {
      "title": "性别",
      "type": "string",
      "enum": ["male", "female"],
      "enumNames": ["男", "女"]
    },
    "age": {
      "title": "年龄",
      "type": "number",
      "placeholder": "请输入年龄"
    },
    "birthday": {
      "title": "出生日期",
      "type": "string",
      "format": "date"
    },
    "remark": {
      "title": "备注",
      "type": "string",
      "format": "textarea",
      "placeholder": "请输入备注"
    }
  },
  "required": ["name", "gender"]
}

注意：
- 只返回 JSON，不要加任何解释文字
- 字段的 key 用英文小写驼峰命名
- 标题用中文
- 根据用户需求合理设置字段类型和验证规则`,
      version: 1,
      enabled: 0,
      remark: '用于表单设计器 AI 生成功能，根据需求描述生成 form-render Schema',
    },
  ];

  for (const p of aiPrompts) {
    const existing = await db.query.sysAiPrompt.findFirst({
      where: eq(schema.sysAiPrompt.code, p.code),
    });
    if (!existing) {
      await db.insert(schema.sysAiPrompt).values(p);
      console.log(`Created ai prompt: ${p.code}`);
    }
  }

  // 给 admin 角色分配菜单权限（在所有菜单创建之后）
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

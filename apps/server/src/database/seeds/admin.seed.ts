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

  console.log('Seed completed');
  await client.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

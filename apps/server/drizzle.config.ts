import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载 server 目录下的 .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const APP_NAME = process.env.APP_NAME ?? 'nest-isle';
const toSnakeCase = (s: string) => s.replace(/-/g, '_');

export default defineConfig({
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? toSnakeCase(APP_NAME),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
  },
});

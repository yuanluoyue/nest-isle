import configuration from './configuration';

const KEYS = [
  'APP_NAME',
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'MINIO_ENDPOINT',
  'MINIO_PORT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'MINIO_USE_SSL',
  'MINIO_BUCKET',
  'MINIO_PUBLIC_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  'REDIS_PASSWORD',
  'REDIS_DB',
] as const;

describe('configuration', () => {
  const original: Record<string, string | undefined> = {};

  beforeEach(() => {
    KEYS.forEach((k) => {
      original[k] = process.env[k];
      delete process.env[k];
    });
  });

  afterEach(() => {
    KEYS.forEach((k) => {
      if (original[k] === undefined) delete process.env[k];
      else process.env[k] = original[k];
    });
  });

  it('应使用默认值', () => {
    const cfg = configuration();

    expect(cfg.appName).toBe('nest-isle');
    expect(cfg.port).toBe(3000);
    expect(cfg.database.host).toBe('localhost');
    expect(cfg.database.port).toBe(5432);
    expect(cfg.database.name).toBe('nest_isle');
    expect(cfg.jwt.secret).toBe('nest-isle-secret');
    expect(cfg.jwt.expiresIn).toBe('7d');
    expect(cfg.minio.bucket).toBe('nest-isle');
    expect(cfg.minio.useSSL).toBe(false);
    expect(cfg.redis.db).toBe(0);
  });

  it('APP_NAME 应派生 DB_NAME（kebab-case 转 snake_case）和 JWT_SECRET', () => {
    process.env.APP_NAME = 'my-cool-app';

    const cfg = configuration();

    expect(cfg.appName).toBe('my-cool-app');
    expect(cfg.database.name).toBe('my_cool_app');
    expect(cfg.jwt.secret).toBe('my-cool-app-secret');
    expect(cfg.minio.bucket).toBe('my-cool-app');
  });

  it('显式设置的环境变量应覆盖默认值', () => {
    process.env.APP_NAME = 'app-x';
    process.env.PORT = '4000';
    process.env.DB_HOST = 'db-host';
    process.env.DB_PORT = '6543';
    process.env.DB_NAME = 'custom_db';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.MINIO_USE_SSL = 'true';
    process.env.REDIS_DB = '2';

    const cfg = configuration();

    expect(cfg.port).toBe(4000);
    expect(cfg.database.host).toBe('db-host');
    expect(cfg.database.port).toBe(6543);
    // DB_NAME 显式覆盖，不再从 APP_NAME 派生
    expect(cfg.database.name).toBe('custom_db');
    expect(cfg.jwt.expiresIn).toBe('1h');
    expect(cfg.minio.useSSL).toBe(true);
    expect(cfg.redis.db).toBe(2);
  });

  it('MINIO_USE_SSL 非 "true" 时应为 false', () => {
    process.env.MINIO_USE_SSL = 'yes';
    expect(configuration().minio.useSSL).toBe(false);

    process.env.MINIO_USE_SSL = 'false';
    expect(configuration().minio.useSSL).toBe(false);
  });
});

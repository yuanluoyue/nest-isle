// kebab-case → snake_case
const toSnakeCase = (s: string) => s.replace(/-/g, '_');

export default () => {
  const APP_NAME = process.env.APP_NAME ?? 'nest-isle';

  return {
    appName: APP_NAME,
    port: parseInt(process.env.PORT ?? '3000', 10),
    database: {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      name: process.env.DB_NAME ?? toSnakeCase(APP_NAME),
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? `${APP_NAME}-secret`,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },
    minio: {
      endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
      port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
      accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
      useSSL: process.env.MINIO_USE_SSL === 'true',
      bucket: process.env.MINIO_BUCKET ?? APP_NAME,
      publicUrl: process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9000',
    },
    redis: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      password: process.env.REDIS_PASSWORD ?? '',
      db: parseInt(process.env.REDIS_DB ?? '0', 10),
    },
  };
};

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'nest_isle',
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'nest-isle-secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});

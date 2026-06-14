import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import configuration from '../config/configuration';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  public readonly db: PostgresJsDatabase<typeof schema>;
  private readonly client: ReturnType<typeof postgres>;

  constructor(private configService: ConfigService) {
    const config = configuration();
    this.client = postgres({
      host: configService.get<string>('database.host', config.database.host),
      port: configService.get<number>('database.port', config.database.port),
      database: configService.get<string>(
        'database.name',
        config.database.name,
      ),
      username: configService.get<string>(
        'database.user',
        config.database.user,
      ),
      password: configService.get<string>(
        'database.password',
        config.database.password,
      ),
    });
    this.db = drizzle(this.client, { schema });
  }

  async onModuleInit() {
    await this.db
      .select({ one: schema.sysUser.id })
      .from(schema.sysUser)
      .limit(1);
    this.logger.log('Database connected');
  }
}

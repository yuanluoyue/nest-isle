import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { LoggerService } from '../observability/logger/logger.service';

@Injectable()
export class RedisCacheService extends CacheService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    loggerService: LoggerService,
  ) {
    super();
    this.logger = loggerService.child('Redis');
    this.client = new Redis({
      host: this.configService.get<string>('redis.host', 'localhost'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password', ''),
      db: this.configService.get<number>('redis.db', 0),
    });

    this.client.on('connect', () => {
      this.logger.info({ action: 'Connected', message: 'Redis connected' });
    });
    this.client.on('error', (err: Error) => {
      this.logger.error({
        action: 'Error',
        message: 'Redis error',
        data: { err: err.message },
      });
    });
    this.client.on('reconnecting', () => {
      this.logger.warn({
        action: 'Reconnecting',
        message: 'Redis reconnecting',
      });
    });
    this.client.on('end', () => {
      this.logger.warn({
        action: 'Disconnected',
        message: 'Redis disconnected',
      });
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<void> {
    await this.client.hdel(key, ...fields);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}

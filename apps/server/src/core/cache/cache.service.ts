export abstract class CacheService {
  abstract get(key: string): Promise<string | null>;
  abstract set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  abstract del(key: string): Promise<void>;
  abstract delByPattern(pattern: string): Promise<void>;
  abstract hget(key: string, field: string): Promise<string | null>;
  abstract hset(key: string, field: string, value: string): Promise<void>;
  abstract hgetall(key: string): Promise<Record<string, string>>;
  abstract hdel(key: string, ...fields: string[]): Promise<void>;
}

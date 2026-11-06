import { Redis } from "@upstash/redis";
import { ICacheService } from "./interfaces/cache.service.interface";
import { env } from "../config/env.config";
import { logger } from "../utils/logger";

export class UpstashCacheService implements ICacheService {
  private readonly redis: Redis;

  constructor(url: string, token: string) {
    this.redis = new Redis({
      url,
      token
    });
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      return await this.redis.get<T>(key);
    } catch (error) {
      logger.warn({ key, error: (error as any)?.message }, "Redis cache get error");
      return null;
    }
  }

  public async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.set(key, value, { ex: ttlSeconds });
    } catch (error) {
      logger.warn({ key, error: (error as any)?.message }, "Redis cache set error");
    }
  }

  public async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.warn({ key, error: (error as any)?.message }, "Redis cache delete error");
    }
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      logger.warn({ pattern, error: (error as any)?.message }, "Redis cache deleteByPattern error");
    }
  }
}

export class MemoryCacheService implements ICacheService {
  private readonly store: Map<string, { value: unknown; expiresAt: number }> = new Map();

  public async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  public async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  public async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }
}

export class CacheServiceFactory {
  public static create(): ICacheService {
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      logger.info("Using Upstash Redis cache service");
      return new UpstashCacheService(
        env.UPSTASH_REDIS_REST_URL,
        env.UPSTASH_REDIS_REST_TOKEN
      );
    }

    logger.info("Using in-memory fallback cache service");
    return new MemoryCacheService();
  }
}


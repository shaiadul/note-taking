import { NextFunction, Request, Response } from "express";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "../config/env.config";
import { TooManyRequestsError } from "../errors/app-error";
import { logger } from "../utils/logger";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export interface IRateLimiterStrategy {
  limit(key: string): Promise<RateLimitResult>;
}

export class UpstashRateLimiterStrategy implements IRateLimiterStrategy {
  private readonly ratelimit: Ratelimit;

  constructor(url: string, token: string) {
    const redis = new Redis({
      url,
      token
    });

    this.ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        env.RATE_LIMIT_MAX_REQUESTS,
        `${Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000)} s`
      ),
      analytics: false,
      prefix: "note_app_ratelimit"
    });
  }

  public async limit(key: string): Promise<RateLimitResult> {
    const res = await this.ratelimit.limit(key);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: res.reset
    };
  }
}

export class MemoryRateLimiterStrategy implements IRateLimiterStrategy {
  private readonly hits: Map<string, { count: number; resetTime: number }> = new Map();

  public async limit(key: string): Promise<RateLimitResult> {
    const now = Date.now();
    const windowMs = env.RATE_LIMIT_WINDOW_MS;
    const max = env.RATE_LIMIT_MAX_REQUESTS;

    const record = this.hits.get(key);

    if (!record || now > record.resetTime) {
      this.hits.set(key, { count: 1, resetTime: now + windowMs });
      return {
        success: true,
        limit: max,
        remaining: max - 1,
        reset: now + windowMs
      };
    }

    if (record.count >= max) {
      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: record.resetTime
      };
    }

    record.count += 1;
    return {
      success: true,
      limit: max,
      remaining: max - record.count,
      reset: record.resetTime
    };
  }
}

export class RateLimiterFactory {
  public static create(): IRateLimiterStrategy {
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      logger.info("Using Upstash Redis rate limiter strategy");
      return new UpstashRateLimiterStrategy(
        env.UPSTASH_REDIS_REST_URL,
        env.UPSTASH_REDIS_REST_TOKEN
      );
    }

    logger.info("Using in-memory fallback rate limiter strategy");
    return new MemoryRateLimiterStrategy();
  }
}

const activeLimiter = RateLimiterFactory.create();

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.user?.userId || req.ip || req.socket.remoteAddress || "anonymous";
    const result = await activeLimiter.limit(identifier);

    res.setHeader("X-RateLimit-Limit", result.limit);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, result.remaining));
    res.setHeader("X-RateLimit-Reset", Math.ceil(result.reset / 1000));

    if (!result.success) {
      throw new TooManyRequestsError("Too many requests, please try again later.");
    }

    next();
  } catch (error) {
    if (error instanceof TooManyRequestsError) {
      next(error);
      return;
    }
    logger.warn({ error: (error as any)?.message }, "Rate limiter upstream issue, failing open");
    next();
  }
};


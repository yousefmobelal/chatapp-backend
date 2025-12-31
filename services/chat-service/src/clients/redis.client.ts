import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import Redis from 'ioredis';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, { lazyConnect: true });

    redis.on('error', (err) => {
      logger.error({ err }, 'Redis connection error');
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('reconnecting', () => {
      logger.warn('Redis reconnecting...');
    });

    redis.on('close', () => {
      logger.info('Redis connection closed');
    });
  }

  return redis;
};

export const connectRedis = async () => {
  const client = getRedisClient();

  if (client.status === 'ready' || client.status === 'connecting') {
    return;
  }

  await client.connect();
};

export const closeRedis = async () => {
  if (!redis) {
    return;
  }

  await redis.quit();
  redis = null;
};

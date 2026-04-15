import Redis from "ioredis";

declare global {
  var __lucentrezRedis__: Redis | null | undefined;
}

const redisUrl = process.env.REDIS_URL?.trim();

function createRedisClient() {
  if (!redisUrl) {
    return null;
  }

  const client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    connectTimeout: 10000,
    retryStrategy(times) {
      return Math.min(times * 200, 2000);
    },
    ...(redisUrl.startsWith("rediss://") ? { tls: {} } : {}),
  });

  client.on("error", (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[redis] connection error", error);
    }
  });

  return client;
}

const redis = globalThis.__lucentrezRedis__ ?? createRedisClient();

if (globalThis.__lucentrezRedis__ === undefined) {
  globalThis.__lucentrezRedis__ = redis;
}

export async function ensureRedisConnection() {
  if (!redis || redis.status === "ready" || redis.status === "connect" || redis.status === "connecting") {
    return redis;
  }

  if (redis.status === "wait") {
    await redis.connect();
  }

  return redis;
}

export function isRedisEnabled() {
  return Boolean(redisUrl && redis);
}

export default redis;

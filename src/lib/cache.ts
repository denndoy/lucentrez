import redis, { ensureRedisConnection, isRedisEnabled } from "@/lib/redis";

const CACHE_PREFIX = process.env.REDIS_KEY_PREFIX?.trim() || "lucentrez";

export const CACHE_TTL = {
  products: 300,
  productBySlug: 300,
  gallery: 300,
  heroSlides: 300,
  contactSettings: 300,
} as const;

export const cacheKeys = {
  products: {
    all: `${CACHE_PREFIX}:products:all`,
    bySlug: (slug: string) => `${CACHE_PREFIX}:products:slug:${slug}`,
    bySlugPattern: `${CACHE_PREFIX}:products:slug:*`,
  },
  gallery: {
    all: `${CACHE_PREFIX}:gallery:all`,
  },
  heroSlides: {
    all: `${CACHE_PREFIX}:hero-slides:all`,
  },
  contactSettings: {
    current: `${CACHE_PREFIX}:contact-settings:current`,
  },
} as const;

export async function getCacheJson<T>(key: string): Promise<T | null> {
  if (!isRedisEnabled()) return null;

  try {
    await ensureRedisConnection();
    const payload = await redis?.get(key);
    return payload ? (JSON.parse(payload) as T) : null;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[redis] failed to read cache key: ${key}`, error);
    }
    return null;
  }
}

export async function setCacheJson<T>(key: string, value: T, ttlSeconds: number) {
  if (!isRedisEnabled()) return;

  try {
    await ensureRedisConnection();
    await redis?.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[redis] failed to write cache key: ${key}`, error);
    }
  }
}

export async function deleteCacheKeys(keys: string[]) {
  if (!isRedisEnabled() || keys.length === 0) return;

  try {
    await ensureRedisConnection();
    await redis?.del(...keys);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[redis] failed to delete cache keys", error);
    }
  }
}

export async function deleteCacheByPattern(pattern: string) {
  if (!isRedisEnabled()) return;

  try {
    await ensureRedisConnection();

    let cursor = "0";
    do {
      const result = await redis?.scan(cursor, "MATCH", pattern, "COUNT", 100);
      if (!result) return;

      cursor = result[0];
      const keys = result[1];
      if (keys.length > 0) {
        await redis?.del(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[redis] failed to delete cache pattern: ${pattern}`, error);
    }
  }
}

export async function invalidateProductsCache() {
  await Promise.all([
    deleteCacheKeys([cacheKeys.products.all]),
    deleteCacheByPattern(cacheKeys.products.bySlugPattern),
  ]);
}

export async function invalidateGalleryCache() {
  await deleteCacheKeys([cacheKeys.gallery.all]);
}

export async function invalidateHeroSlidesCache() {
  await deleteCacheKeys([cacheKeys.heroSlides.all]);
}

export async function invalidateContactSettingsCache() {
  await deleteCacheKeys([cacheKeys.contactSettings.current]);
}

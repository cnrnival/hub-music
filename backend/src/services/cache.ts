/**
 * Hub Music - Cache Service
 * Serviço de cache: memória para dev, Vercel KV para produção, cache-aside
 * Cache service: memory for dev, Vercel KV for production, cache-aside pattern
 * 
 * @languages pt-BR / en-US
 */

import { createClient } from '@vercel/kv';

// In-memory cache for development / Cache em memória para desenvolvimento
const memoryCache = new Map<string, { value: unknown; expiry: number }>();

// Redis/Vercel KV client (optional) / Cliente Redis/Vercel KV (opcional)
let kvClient: ReturnType<typeof createClient> | null = null;

if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  kvClient = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN
  });
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

const DEFAULT_TTL = 300; // 5 minutes

/**
 * Get value from cache (tries KV first, falls back to memory)
 */
export async function getCache<T>(key: string): Promise<T | null> {
  // Try Vercel KV first (production)
  if (kvClient) {
    try {
      const value = await kvClient.get<T>(key);
      if (value !== null) return value;
    } catch (err) {
      console.warn('KV get failed, falling back to memory:', err);
    }
  }

  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.value as T;
  }

  // Clean up expired entry
  if (entry) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set value in cache (writes to both KV and memory)
 */
export async function setCache<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  const ttl = options.ttl || DEFAULT_TTL;
  const expiry = Date.now() + ttl * 1000;

  // Write to memory cache immediately
  memoryCache.set(key, { value, expiry });

  // Write to KV asynchronously (don't await in production for speed)
  if (kvClient) {
    try {
      await kvClient.set(key, value, { ex: ttl });
    } catch (err) {
      console.warn('KV set failed:', err);
    }
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  memoryCache.delete(key);

  if (kvClient) {
    try {
      await kvClient.del(key);
    } catch (err) {
      console.warn('KV delete failed:', err);
    }
  }
}

/**
 * Delete multiple keys by pattern (memory only, KV doesn't support patterns easily)
 */
export async function deleteCacheByPattern(pattern: string): Promise<void> {
  const regex = new RegExp(pattern.replace('*', '.*'));
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key);
    }
  }

  // Note: KV pattern deletion would require SCAN + DEL, skip for now
}

/**
 * Invalidate cache by tags (memory only for now)
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  // In a real implementation, you'd maintain a tag->keys index
  // For now, we'll use a simple prefix-based approach
  for (const tag of tags) {
    await deleteCacheByPattern(`tag:${tag}:*`);
  }
}

/**
 * Get or set cache with a factory function (cache-aside pattern)
 */
export async function getOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const value = await factory();
  await setCache(key, value, options);
  return value;
}

/**
 * Cache wrapper for API responses
 */
export function createCacheMiddleware(defaultTtl = DEFAULT_TTL) {
  return async function cacheMiddleware(
    request: any,
    reply: any,
    done: () => void
  ) {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return done();
    }

    const cacheKey = `api:${request.url}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      reply.header('X-Cache', 'HIT');
      return reply.send(cached);
    }

    // Wrap reply.send to cache the response
    const originalSend = reply.send.bind(reply);
    reply.send = (payload: any) => {
      if (reply.statusCode === 200) {
        setCache(cacheKey, payload, { ttl: defaultTtl }).catch(console.warn);
      }
      return originalSend(payload);
    };

    reply.header('X-Cache', 'MISS');
    done();
  };
}

/**
 * Clear all cache (useful for testing)
 */
export async function clearCache(): Promise<void> {
  memoryCache.clear();
  if (kvClient) {
    try {
      // Note: This would need a proper implementation with SCAN
      console.warn('KV clear not implemented');
    } catch (err) {
      console.warn('KV clear failed:', err);
    }
  }
}

/**
 * Get cache stats
 */
export function getCacheStats(): { memoryKeys: number; memorySize: number } {
  let size = 0;
  for (const entry of memoryCache.values()) {
    size += JSON.stringify(entry.value).length;
  }
  return {
    memoryKeys: memoryCache.size,
    memorySize: size
  };
}

export default {
  get: getCache,
  set: setCache,
  delete: deleteCache,
  deleteByPattern: deleteCacheByPattern,
  invalidateByTags,
  getOrSet,
  createCacheMiddleware,
  clear: clearCache,
  stats: getCacheStats
};
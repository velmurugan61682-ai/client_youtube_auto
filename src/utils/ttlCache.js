/**
 * Lightweight in-memory TTL cache with no external dependencies.
 * Default TTL is 3 minutes (180,000 ms).
 */

const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

class MemoryTTLCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Retrieve cached value if fresh
   * @param {string} key 
   * @returns {*|null} cached data or null if missing/expired
   */
  get(key) {
    if (!key) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached value with TTL
   * @param {string} key 
   * @param {*} data 
   * @param {number} [ttlMs] 
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    if (!key) return;
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  /**
   * Invalidate specific key or keys matching prefix/pattern
   * @param {string|RegExp} keyOrPattern 
   */
  invalidate(keyOrPattern) {
    if (!keyOrPattern) return;
    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern);
      // Also delete any key starting with prefix
      for (const k of this.cache.keys()) {
        if (k.startsWith(keyOrPattern)) {
          this.cache.delete(k);
        }
      }
    } else if (keyOrPattern instanceof RegExp) {
      for (const k of this.cache.keys()) {
        if (keyOrPattern.test(k)) {
          this.cache.delete(k);
        }
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }
}

export const ttlCache = new MemoryTTLCache();
export default ttlCache;

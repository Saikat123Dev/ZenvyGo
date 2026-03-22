import { REDIS_PREFIXES, REDIS_TTL } from '../config/redis.config';

type CacheEntry =
  | { kind: 'value'; value: string; expiresAt?: number }
  | { kind: 'list'; value: string[]; expiresAt?: number }
  | { kind: 'set'; value: Set<string>; expiresAt?: number };

/**
 * In-memory cache singleton
 * Replaces Redis with process-local storage
 */
class MemoryCache {
  private static instance: MemoryCache | null = null;
  private readonly store = new Map<string, CacheEntry>();
  private isConnected = true;

  private constructor() {}

  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  public async connect(): Promise<void> {
    this.isConnected = true;
  }

  private isExpired(entry: CacheEntry): boolean {
    return typeof entry.expiresAt === 'number' && entry.expiresAt <= Date.now();
  }

  private getEntry(key: string): CacheEntry | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  private applyTtl(entry: CacheEntry, ttl?: number): void {
    if (ttl && ttl > 0) {
      entry.expiresAt = Date.now() + ttl * 1000;
    } else {
      delete entry.expiresAt;
    }
  }

  public async set(
    key: string,
    value: string | number | boolean | object,
    ttl?: number,
  ): Promise<void> {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const entry: CacheEntry = { kind: 'value', value: serializedValue };
    this.applyTtl(entry, ttl);
    this.store.set(key, entry);
  }

  public async get(key: string): Promise<string | null> {
    const entry = this.getEntry(key);
    if (!entry || entry.kind !== 'value') {
      return null;
    }
    return entry.value;
  }

  public async getObject<T = any>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  public async delete(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  public async deleteMany(keys: string[]): Promise<number> {
    let deleted = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        deleted += 1;
      }
    }
    return deleted;
  }

  public async exists(key: string): Promise<boolean> {
    return Boolean(this.getEntry(key));
  }

  public async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.getEntry(key);
    if (!entry) {
      return false;
    }
    this.applyTtl(entry, ttl);
    this.store.set(key, entry);
    return true;
  }

  public async getTTL(key: string): Promise<number> {
    const entry = this.getEntry(key);
    if (!entry) {
      return -2;
    }
    if (typeof entry.expiresAt !== 'number') {
      return -1;
    }
    return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
  }

  public async increment(key: string, by = 1): Promise<number> {
    const currentRaw = await this.get(key);
    const current = currentRaw ? Number(currentRaw) : 0;
    const next = current + by;
    await this.set(key, String(next));
    return next;
  }

  public async decrement(key: string, by = 1): Promise<number> {
    return this.increment(key, -by);
  }

  public async listPush(key: string, value: string | object): Promise<number> {
    const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const entry = this.getEntry(key);
    let list: string[] = [];
    if (entry && entry.kind === 'list') {
      list = entry.value;
    }
    list.unshift(serializedValue);
    const updated: CacheEntry = { kind: 'list', value: list, expiresAt: entry?.expiresAt };
    this.store.set(key, updated);
    return list.length;
  }

  public async listPop(key: string): Promise<string | null> {
    const entry = this.getEntry(key);
    if (!entry || entry.kind !== 'list') {
      return null;
    }
    const value = entry.value.pop() ?? null;
    if (entry.value.length === 0) {
      this.store.delete(key);
    } else {
      this.store.set(key, entry);
    }
    return value;
  }

  public async listLength(key: string): Promise<number> {
    const entry = this.getEntry(key);
    if (!entry || entry.kind !== 'list') {
      return 0;
    }
    return entry.value.length;
  }

  public async setAdd(key: string, member: string): Promise<number> {
    const entry = this.getEntry(key);
    const set = entry && entry.kind === 'set' ? entry.value : new Set<string>();
    const hadMember = set.has(member);
    set.add(member);
    const updated: CacheEntry = { kind: 'set', value: set, expiresAt: entry?.expiresAt };
    this.store.set(key, updated);
    return hadMember ? 0 : 1;
  }

  public async setRemove(key: string, member: string): Promise<number> {
    const entry = this.getEntry(key);
    if (!entry || entry.kind !== 'set') {
      return 0;
    }
    const hadMember = entry.value.delete(member);
    if (entry.value.size === 0) {
      this.store.delete(key);
    } else {
      this.store.set(key, entry);
    }
    return hadMember ? 1 : 0;
  }

  public async setIsMember(key: string, member: string): Promise<boolean> {
    const entry = this.getEntry(key);
    return Boolean(entry && entry.kind === 'set' && entry.value.has(member));
  }

  public async setMembers(key: string): Promise<string[]> {
    const entry = this.getEntry(key);
    if (!entry || entry.kind !== 'set') {
      return [];
    }
    return Array.from(entry.value);
  }

  public async findKeys(pattern: string): Promise<string[]> {
    const regex = this.patternToRegex(pattern);
    return Array.from(this.store.keys()).filter((key) => regex.test(key));
  }

  public async clearPattern(pattern: string): Promise<number> {
    const keys = await this.findKeys(pattern);
    return this.deleteMany(keys);
  }

  public async getInfo(): Promise<string> {
    return `memory_cache_keys:${this.store.size}`;
  }

  public async flushDatabase(): Promise<string> {
    this.store.clear();
    return 'OK';
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.store.clear();
  }

  public getStatus(): {
    isConnected: boolean;
    status?: string;
  } {
    return {
      isConnected: this.isConnected,
      status: this.isConnected ? 'ready' : 'disconnected',
    };
  }

  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
    const regexString = `^${escaped.replace(/\*/g, '.*')}$`;
    return new RegExp(regexString);
  }
}

export const redis = MemoryCache.getInstance();

export { REDIS_PREFIXES, REDIS_TTL };

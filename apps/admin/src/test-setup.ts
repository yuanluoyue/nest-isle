import { beforeEach } from 'vitest';

/**
 * 最小 localStorage / sessionStorage / window polyfill。
 * 这些测试只涉及纯逻辑模块（zustand persist、记住密码 helper），
 * 不需要完整 DOM，因此用 node 环境加 polyfill 比 jsdom 更轻量稳定。
 * 注意：zustand persist 默认存储是 createJSONStorage(() => window.localStorage)，
 * 必须定义 window，否则 persist 会因 storage 为空而静默跳过写入。
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorage();
}
if (typeof (globalThis as any).sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new MemoryStorage();
}

// 每个测试前清空存储，避免 zustand persist 在用例间残留状态
beforeEach(() => {
  (globalThis as any).localStorage.clear();
  (globalThis as any).sessionStorage.clear();
});

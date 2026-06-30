import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useLocalAccountStore,
  type LocalAccount,
} from './local-accounts';

function resetStore() {
  useLocalAccountStore.setState({ accounts: [] });
}

function addAccount(over: Partial<LocalAccount> = {}) {
  const before = useLocalAccountStore.getState().accounts;
  useLocalAccountStore.getState().addAccount({
    username: over.username ?? 'alice',
    password: over.password ?? 'pw1',
    remark: over.remark,
    ...over,
  });
  const after = useLocalAccountStore.getState().accounts;
  return after[after.length - 1];
}

describe('useLocalAccountStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addAccount', () => {
    it('应追加账号并生成 id / 时间戳', () => {
      const created = addAccount({ username: 'bob', password: 'secret' });

      expect(created.id).toBeTruthy();
      expect(created.username).toBe('bob');
      expect(created.password).toBe('secret');
      expect(created.createdAt).toBeGreaterThan(0);
      expect(created.updatedAt).toBe(created.createdAt);
      expect(useLocalAccountStore.getState().accounts).toHaveLength(1);
    });

    it('多次添加应生成不同 id', () => {
      const a = addAccount({ username: 'a' });
      vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
      const b = addAccount({ username: 'b' });

      expect(a.id).not.toBe(b.id);
      expect(useLocalAccountStore.getState().accounts).toHaveLength(2);
    });
  });

  describe('updateAccount', () => {
    it('应更新指定账号并刷新 updatedAt', () => {
      const created = addAccount({ username: 'carol', password: 'p1' });
      const originalUpdatedAt = created.updatedAt;

      // 推进时间以确保 updatedAt 前进
      vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));

      useLocalAccountStore.getState().updateAccount(created.id, {
        password: 'p2',
        remark: 'updated',
      });

      const updated = useLocalAccountStore
        .getState()
        .accounts.find((x) => x.id === created.id)!;

      expect(updated.password).toBe('p2');
      expect(updated.remark).toBe('updated');
      expect(updated.username).toBe('carol'); // 未传字段保留
      expect(updated.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('更新不存在的 id 不影响列表', () => {
      addAccount({ username: 'dave' });
      const before = useLocalAccountStore.getState().accounts;

      useLocalAccountStore.getState().updateAccount('nope', { password: 'x' });

      expect(useLocalAccountStore.getState().accounts).toEqual(before);
    });
  });

  describe('removeAccount', () => {
    it('应删除指定账号', () => {
      const a = addAccount({ username: 'a' });
      addAccount({ username: 'b' });

      useLocalAccountStore.getState().removeAccount(a.id);

      const accounts = useLocalAccountStore.getState().accounts;
      expect(accounts).toHaveLength(1);
      expect(accounts.find((x) => x.id === a.id)).toBeUndefined();
    });

    it('删除不存在的 id 不报错且列表不变', () => {
      addAccount({ username: 'a' });
      const before = useLocalAccountStore.getState().accounts;

      expect(() =>
        useLocalAccountStore.getState().removeAccount('nope'),
      ).not.toThrow();
      expect(useLocalAccountStore.getState().accounts).toHaveLength(
        before.length,
      );
    });
  });

  describe('findByUsername', () => {
    it('应返回匹配的账号', () => {
      addAccount({ username: 'eve', password: 'p' });

      const found = useLocalAccountStore.getState().findByUsername('eve');
      expect(found).toBeDefined();
      expect(found?.password).toBe('p');
    });

    it('未匹配返回 undefined', () => {
      addAccount({ username: 'eve' });

      expect(
        useLocalAccountStore.getState().findByUsername('missing'),
      ).toBeUndefined();
    });
  });

  describe('持久化', () => {
    it('状态变更应写入 localStorage', () => {
      addAccount({ username: 'persisted', password: 'p' });

      const raw = localStorage.getItem('local-accounts');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      // zustand persist 包了一层 { state, version }
      const accounts = parsed.state?.accounts ?? parsed.accounts;
      expect(accounts.some((a: LocalAccount) => a.username === 'persisted')).toBe(
        true,
      );
    });
  });
});

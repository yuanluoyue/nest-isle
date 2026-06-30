import { describe, it, expect, beforeEach } from 'vitest';
import {
  useAuthStore,
  saveRememberPassword,
  getRememberPassword,
  clearRememberPassword,
} from './auth';
import type { UserInfo } from '../types/api';

const USER: UserInfo = {
  id: 'u1',
  username: 'admin',
  nickname: '管理员',
} as any;

function resetStore() {
  useAuthStore.setState({
    accessToken: null,
    refreshToken: null,
    user: null,
  });
}

describe('useAuthStore', () => {
  beforeEach(() => {
    resetStore();
    localStorage.clear();
  });

  describe('初始状态', () => {
    it('未认证', () => {
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().refreshToken).toBeNull();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    });
  });

  describe('setTokens / setUser', () => {
    it('setTokens 应同时写入 access/refresh token', () => {
      useAuthStore.getState().setTokens('access-1', 'refresh-1');

      const s = useAuthStore.getState();
      expect(s.accessToken).toBe('access-1');
      expect(s.refreshToken).toBe('refresh-1');
      expect(s.isAuthenticated()).toBe(true);
    });

    it('setUser 应写入用户信息', () => {
      useAuthStore.getState().setUser(USER);
      expect(useAuthStore.getState().user).toEqual(USER);
    });
  });

  describe('clearAuth', () => {
    it('应清空所有认证状态', () => {
      useAuthStore.getState().setTokens('a', 'r');
      useAuthStore.getState().setUser(USER);

      useAuthStore.getState().clearAuth();

      const s = useAuthStore.getState();
      expect(s.accessToken).toBeNull();
      expect(s.refreshToken).toBeNull();
      expect(s.user).toBeNull();
      expect(s.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('仅 accessToken 存在时为 true', () => {
      useAuthStore.getState().setTokens('a', 'r');
      expect(useAuthStore.getState().isAuthenticated()).toBe(true);
    });
  });

  describe('持久化（partialize）', () => {
    it('token 应写入 localStorage（user 不持久化）', () => {
      useAuthStore.getState().setTokens('a', 'r');
      useAuthStore.getState().setUser(USER);

      const raw = localStorage.getItem('auth-storage');
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      const state = parsed.state ?? parsed;
      expect(state.accessToken).toBe('a');
      expect(state.refreshToken).toBe('r');
      // partialize 仅保留 token
      expect(state.user).toBeUndefined();
    });
  });
});

describe('记住密码 helper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('无记录时 getRememberPassword 返回 null', () => {
    expect(getRememberPassword()).toBeNull();
  });

  it('saveRememberPassword / getRememberPassword 应往返一致', () => {
    saveRememberPassword('alice', 'secret');

    const got = getRememberPassword();
    expect(got).toEqual({ username: 'alice', password: 'secret' });
  });

  it('损坏的 JSON 应返回 null 而不抛错', () => {
    localStorage.setItem('remember_password', '{not-json');
    expect(getRememberPassword()).toBeNull();
  });

  it('clearRememberPassword 应移除记录', () => {
    saveRememberPassword('alice', 'secret');
    clearRememberPassword();

    expect(getRememberPassword()).toBeNull();
    expect(localStorage.getItem('remember_password')).toBeNull();
  });
});

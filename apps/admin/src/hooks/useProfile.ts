import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { getProfile, getUserMenus } from '../api/auth';

export function useProfile() {
  const { setUser } = useAuthStore();
  const { setMenus } = useMenuStore();

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    // 每次都重新获取用户信息和菜单
    getProfile().then(setUser).catch(() => {});
    getUserMenus().then(setMenus).catch(() => {});
  }, []);

  return useAuthStore((s) => s.user);
}

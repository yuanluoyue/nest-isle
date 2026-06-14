import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth';
import { getProfile } from '../api/auth';

export function useProfile() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (useAuthStore.getState().accessToken && !user) {
      getProfile().then(setUser).catch(() => {});
    }
  }, []);

  return user;
}

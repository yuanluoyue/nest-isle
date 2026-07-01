import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  themeMode: 'light' | 'dark';
  menuCollapsed: boolean;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleThemeMode: () => void;
  setMenuCollapsed: (collapsed: boolean) => void;
  toggleMenuCollapsed: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      menuCollapsed: false,

      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleThemeMode: () =>
        set({ themeMode: get().themeMode === 'light' ? 'dark' : 'light' }),

      setMenuCollapsed: (collapsed) => set({ menuCollapsed: collapsed }),
      toggleMenuCollapsed: () => set({ menuCollapsed: !get().menuCollapsed }),
    }),
    {
      name: 'app-settings',
    },
  ),
);

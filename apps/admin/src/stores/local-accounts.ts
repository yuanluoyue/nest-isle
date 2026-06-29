import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalAccount {
  id: string;
  username: string;
  password: string;
  remark?: string;
  createdAt: number;
  updatedAt: number;
}

interface LocalAccountState {
  accounts: LocalAccount[];
  addAccount: (account: Omit<LocalAccount, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, account: Partial<Omit<LocalAccount, 'id' | 'createdAt'>>) => void;
  removeAccount: (id: string) => void;
  findByUsername: (username: string) => LocalAccount | undefined;
}

export const useLocalAccountStore = create<LocalAccountState>()(
  persist(
    (set, get) => ({
      accounts: [],

      addAccount: (account) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            {
              ...account,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      updateAccount: (id, account) =>
        set((state) => ({
          accounts: state.accounts.map((item) =>
            item.id === id ? { ...item, ...account, updatedAt: Date.now() } : item,
          ),
        })),

      removeAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((item) => item.id !== id),
        })),

      findByUsername: (username) =>
        get().accounts.find((item) => item.username === username),
    }),
    { name: 'local-accounts' },
  ),
);

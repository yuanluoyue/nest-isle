import { create } from 'zustand';
import { getUnreadCount } from '../api/notification';
import type { NotificationReceiverItem } from '../types/api';

interface NotificationState {
  unreadCount: number;
  latestNotifications: NotificationReceiverItem[];
  fetchUnreadCount: () => Promise<void>;
  incrementUnread: () => void;
  setLatestNotifications: (notifications: NotificationReceiverItem[]) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  unreadCount: 0,
  latestNotifications: [],

  fetchUnreadCount: async () => {
    try {
      const result = await getUnreadCount();
      set({ unreadCount: result.count });
    } catch {
      // 静默处理
    }
  },

  incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  setLatestNotifications: (notifications) =>
    set({ latestNotifications: notifications.slice(0, 5) }),
}));

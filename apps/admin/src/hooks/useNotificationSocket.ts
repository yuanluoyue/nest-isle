import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import { useNotificationStore } from '../stores/notification';
import { getNotificationList } from '../api/notification';

export function useNotificationSocket() {
  const socketRef = useRef<Socket | null>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const setLatestNotifications = useNotificationStore((s) => s.setLatestNotifications);

  const loadLatestNotifications = useCallback(async () => {
    try {
      const res = await getNotificationList({ page: 1, pageSize: 5 });
      setLatestNotifications(res.list);
    } catch {
      // 静默处理
    }
  }, [setLatestNotifications]);

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const socket = io('/notification', {
      auth: { userId: user.id },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      fetchUnreadCount();
      loadLatestNotifications();
    });

    socket.on('notification', () => {
      fetchUnreadCount();
      loadLatestNotifications();
    });

    socketRef.current = socket;

    // 首次加载
    fetchUnreadCount();
    loadLatestNotifications();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user?.id, fetchUnreadCount, loadLatestNotifications]);
}

import request from '../utils/request';
import type {
  NotificationReceiverItem,
  NotificationListResult,
  QueryNotificationParams,
} from '../types/api';

export const getNotificationList = (params: QueryNotificationParams) =>
  request.get<any, NotificationListResult>('/notification', { params });

export const getNotificationDetail = (id: string) =>
  request.get<any, NotificationReceiverItem>(`/notification/${id}`);

export const getUnreadCount = () =>
  request.get<any, { count: number }>('/notification/unread-count');

export const markAsRead = (id: string) =>
  request.put<any, NotificationReceiverItem>(`/notification/${id}/read`);

export const markAllAsRead = () =>
  request.put<any, void>('/notification/read-all');

export const deleteNotification = (id: string) =>
  request.delete<any, void>(`/notification/${id}`);

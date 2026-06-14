import request from '../utils/request';
import type {
  NoticeItem,
  NoticeListResult,
  CreateNoticeParams,
  UpdateNoticeParams,
  QueryNoticeParams,
} from '../types/api';

export const getNoticeList = (params: QueryNoticeParams) =>
  request.get<any, NoticeListResult>('/system/notice', { params });

export const getNoticeDetail = (id: string) =>
  request.get<any, NoticeItem>(`/system/notice/${id}`);

export const createNotice = (data: CreateNoticeParams) =>
  request.post<any, NoticeItem>('/system/notice', data);

export const updateNotice = (id: string, data: UpdateNoticeParams) =>
  request.put<any, NoticeItem>(`/system/notice/${id}`, data);

export const deleteNotice = (id: string) =>
  request.delete<any, void>(`/system/notice/${id}`);

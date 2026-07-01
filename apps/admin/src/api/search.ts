import request from '../utils/request';
import type { SearchItem, SearchHistoryItem } from '../types/api';

export const globalSearch = (keyword: string, providers?: string[]) =>
  request.get<any, SearchItem[]>('/search', {
    params: { keyword, providers: providers?.join(',') },
  });

export const getSearchHistory = () =>
  request.get<any, SearchHistoryItem[]>('/search/history');

export const clearSearchHistory = () =>
  request.delete<any, void>('/search/history');

export const deleteSearchHistoryItem = (id: string) =>
  request.delete<any, void>(`/search/history/${id}`);

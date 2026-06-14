import request from '../utils/request';
import type { DashboardStats } from '../types/api';

export const getDashboardStats = () =>
  request.get<any, DashboardStats>('/dashboard/stats');

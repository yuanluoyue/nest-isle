import request from '../utils/request';
import type {
  JobItem,
  JobListResult,
  CreateJobParams,
  UpdateJobParams,
  QueryJobParams,
  JobLogListResult,
  QueryJobLogParams,
} from '../types/api';

export const getJobList = (params: QueryJobParams) =>
  request.get<any, JobListResult>('/monitor/job', { params });

export const getJobDetail = (id: string) =>
  request.get<any, JobItem>(`/monitor/job/${id}`);

export const createJob = (data: CreateJobParams) =>
  request.post<any, JobItem>('/monitor/job', data);

export const updateJob = (id: string, data: UpdateJobParams) =>
  request.put<any, JobItem>(`/monitor/job/${id}`, data);

export const deleteJob = (id: string) =>
  request.delete<any, void>(`/monitor/job/${id}`);

export const startJob = (id: string) =>
  request.put<any, JobItem>(`/monitor/job/${id}/start`);

export const stopJob = (id: string) =>
  request.put<any, JobItem>(`/monitor/job/${id}/stop`);

export const runJobOnce = (id: string) =>
  request.post<any, { success: boolean }>(`/monitor/job/${id}/run`);

export const getJobLogList = (params: QueryJobLogParams) =>
  request.get<any, JobLogListResult>('/monitor/job/log', { params });

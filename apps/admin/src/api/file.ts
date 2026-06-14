import request from '../utils/request';

export interface FileUploadResult {
  id: string;
  name: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  storage: string;
  bucket: string;
  createdBy: string;
  createdAt: string;
}

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, FileUploadResult>('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<any, FileUploadResult>('/file/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

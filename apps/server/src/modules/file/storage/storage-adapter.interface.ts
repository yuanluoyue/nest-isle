export interface UploadResult {
  path: string;
  url: string;
  size: number;
}

export interface StorageConfig {
  endpoint: string;
  port: number;
  accessKey: string;
  secretKey: string;
  useSSL: boolean;
  bucket: string;
  publicUrl: string;
}

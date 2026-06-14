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

export abstract class StorageAdapter {
  abstract upload(
    bucket: string,
    path: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<UploadResult>;

  abstract getUrl(bucket: string, path: string): string;

  abstract ensureBucket(bucket: string): Promise<void>;

  abstract removeObject(bucket: string, path: string): Promise<void>;
}

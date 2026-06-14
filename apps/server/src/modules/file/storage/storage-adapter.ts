import { UploadResult } from './storage-adapter.interface';

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

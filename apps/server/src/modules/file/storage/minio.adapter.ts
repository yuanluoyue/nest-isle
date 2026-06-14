import { Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { StorageAdapter } from './storage-adapter';
import { UploadResult, StorageConfig } from './storage-adapter.interface';

export class MinioAdapter extends StorageAdapter {
  private readonly client: Minio.Client;
  private readonly config: StorageConfig;
  private readonly logger = new Logger(MinioAdapter.name);

  constructor(config: StorageConfig) {
    super();
    this.config = config;
    this.client = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      useSSL: config.useSSL,
    });
  }

  async upload(bucket: string, path: string, buffer: Buffer, mimeType: string): Promise<UploadResult> {
    await this.ensureBucket(bucket);

    await this.client.putObject(bucket, path, buffer, buffer.length, {
      'Content-Type': mimeType,
    });

    return {
      path,
      url: this.getUrl(bucket, path),
      size: buffer.length,
    };
  }

  getUrl(bucket: string, path: string): string {
    return `${this.config.publicUrl}/${bucket}/${path}`;
  }

  async removeObject(bucket: string, path: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, path);
    } catch (error) {
      this.logger.error(`Failed to remove object ${bucket}/${path}: ${error.message}`);
      throw error;
    }
  }

  async ensureBucket(bucket: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        // 设置桶策略为公开读取
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${bucket}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(bucket, JSON.stringify(policy));
        this.logger.log(`Created bucket: ${bucket}`);
      }
    } catch (error) {
      this.logger.error(`Failed to ensure bucket ${bucket}: ${error.message}`);
      throw error;
    }
  }
}

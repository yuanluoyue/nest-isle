import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNull, sum } from 'drizzle-orm';
import { sysFile } from '../../database/schema';
import { DatabaseService } from '../../database/database.service';
import { StorageAdapter } from '../../core/storage/storage.adapter';
import type { UploadedFile } from '../../types/uploaded-file';
import { LoggerService } from '../../core/logger/logger.service';

@Injectable()
export class FileService {
  private readonly bucket: string;
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private storageAdapter: StorageAdapter,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('File');
    this.bucket = this.configService.get<string>('minio.bucket')!;

    // 启动时确保 bucket 存在
    this.storageAdapter.ensureBucket(this.bucket).catch((err: unknown) => {
      this.logger.error({
        action: 'EnsureBucketFailed',
        message: 'Failed to ensure bucket',
        data: { err: err instanceof Error ? err.message : String(err) },
      });
    });
  }

  private get db() {
    return this.databaseService.db;
  }

  async upload(file: UploadedFile, createdBy: string, directory = 'uploads') {
    const ext = file.originalname.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const name = `${timestamp}-${randomStr}.${ext}`;
    const path = `${directory}/${name}`;

    const result = await this.storageAdapter.upload(
      this.bucket,
      path,
      file.buffer,
      file.mimetype,
    );

    const [record] = await this.db
      .insert(sysFile)
      .values({
        name,
        originalName: file.originalname,
        path: result.path,
        url: result.url,
        size: result.size,
        mimeType: file.mimetype,
        storage: 'minio',
        bucket: this.bucket,
        createdBy,
      })
      .returning();

    this.logger.info({
      action: 'Upload',
      message: 'File uploaded',
      data: { url: result.url, size: result.size },
    });

    return record;
  }

  async getTotalSize() {
    const [result] = await this.db
      .select({ totalSize: sum(sysFile.size) })
      .from(sysFile)
      .where(isNull(sysFile.deletedAt));

    return { totalSize: Number(result.totalSize) || 0 };
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const record = await this.db.query.sysFile.findFirst({
      where: and(eq(sysFile.url, url), isNull(sysFile.deletedAt)),
    });

    if (!record) {
      this.logger.warn({
        action: 'DeleteNotFound',
        message: 'File record not found',
        data: { url },
      });
      return;
    }

    await this.db
      .update(sysFile)
      .set({ deletedAt: new Date() })
      .where(eq(sysFile.id, record.id));

    if (record.bucket && record.path) {
      try {
        await this.storageAdapter.removeObject(record.bucket, record.path);
      } catch (error) {
        this.logger.error({
          action: 'RemoveObjectFailed',
          message: 'Failed to remove storage object',
          data: {
            bucket: record.bucket,
            path: record.path,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    }

    this.logger.info({
      action: 'Delete',
      message: 'File deleted',
      data: { url },
    });
  }
}

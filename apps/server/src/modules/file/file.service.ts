import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, isNull, sum } from 'drizzle-orm';
import { sysFile } from '../../database/schema';
import { DatabaseService } from '../../database/database.service';
import { StorageAdapter, MinioAdapter, StorageConfig } from './storage';

@Injectable()
export class FileService {
  private readonly storageAdapter: StorageAdapter;
  private readonly bucket: string;
  private readonly logger = new Logger(FileService.name);

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    const storageConfig: StorageConfig = {
      endpoint: this.configService.get<string>('minio.endpoint', 'localhost'),
      port: this.configService.get<number>('minio.port', 9000),
      accessKey: this.configService.get<string>('minio.accessKey', 'minioadmin'),
      secretKey: this.configService.get<string>('minio.secretKey', 'minioadmin'),
      useSSL: this.configService.get<boolean>('minio.useSSL', false),
      bucket: this.configService.get<string>('minio.bucket', 'nest-isle'),
      publicUrl: this.configService.get<string>('minio.publicUrl', 'http://localhost:9000'),
    };

    this.bucket = storageConfig.bucket;
    this.storageAdapter = new MinioAdapter(storageConfig);

    // 启动时确保 bucket 存在
    this.storageAdapter.ensureBucket(this.bucket).catch((err) => {
      this.logger.error(`Failed to ensure bucket: ${err.message}`);
    });
  }

  private get db() {
    return this.databaseService.db;
  }

  async upload(file: Express.Multer.File, createdBy: string, directory = 'uploads') {
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

    return record;
  }

  async getTotalSize() {
    const [result] = await this.db
      .select({ totalSize: sum(sysFile.size) })
      .from(sysFile)
      .where(isNull(sysFile.deletedAt));

    return { totalSize: Number(result.totalSize) || 0 };
  }

  /**
   * 根据 URL 删除文件（软删 sys_file 记录 + 删除存储对象）
   * 仅在 url 命中 sys_file 中未删除的记录时才执行
   */
  async deleteByUrl(url: string): Promise<void> {
    if (!url) return;

    const record = await this.db.query.sysFile.findFirst({
      where: and(eq(sysFile.url, url), isNull(sysFile.deletedAt)),
    });

    if (!record) {
      this.logger.warn(`File record not found for url: ${url}`);
      return;
    }

    // 先软删数据库记录
    await this.db
      .update(sysFile)
      .set({ deletedAt: new Date() })
      .where(eq(sysFile.id, record.id));

    // 再删存储对象（失败不影响业务，仅记录日志）
    if (record.bucket && record.path) {
      try {
        await this.storageAdapter.removeObject(record.bucket, record.path);
      } catch (error) {
        this.logger.error(
          `Failed to remove storage object ${record.bucket}/${record.path}: ${error.message}`,
        );
      }
    }
  }
}

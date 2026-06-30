import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageAdapter } from './storage.adapter';
import { MinioAdapter } from './minio.adapter';
import type { StorageConfig } from './storage.adapter';

@Global()
@Module({
  providers: [
    {
      provide: StorageAdapter,
      useFactory: (configService: ConfigService) => {
        const config: StorageConfig = {
          endpoint: configService.get<string>('minio.endpoint', 'localhost'),
          port: configService.get<number>('minio.port', 9000),
          accessKey: configService.get<string>('minio.accessKey', 'minioadmin'),
          secretKey: configService.get<string>('minio.secretKey', 'minioadmin'),
          useSSL: configService.get<boolean>('minio.useSSL', false),
          bucket: configService.get<string>('minio.bucket')!,
          publicUrl: configService.get<string>(
            'minio.publicUrl',
            'http://localhost:9000',
          ),
        };
        return new MinioAdapter(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [StorageAdapter],
})
export class StorageModule {}

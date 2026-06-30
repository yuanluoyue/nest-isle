import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyMultipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { OperateLogInterceptor } from './common/interceptor/operate-log.interceptor';
import { winstonLoggerConfig } from './core/logger/winston.config';
import { DatabaseService } from './database/database.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      logger: WinstonModule.createLogger(winstonLoggerConfig),
    },
  );

  // 注册 @fastify/multipart 用于文件上传
  await app.register(fastifyMultipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new OperateLogInterceptor(app.get(Reflector), app.get(DatabaseService)),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  const appConfig = app.get(ConfigService);
  const appName = appConfig.get<string>('appName') ?? 'NestIsle';
  const appTitle = appName
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const config = new DocumentBuilder()
    .setTitle(`${appTitle} API`)
    .setDescription('通用后台管理系统 API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

void bootstrap();

import * as winston from 'winston';
import { utilities as nestWinstonUtilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const APP_NAME = process.env.APP_NAME ?? 'nest-isle';
const APP_LABEL = APP_NAME.replace(/-/g, '').replace(/\b\w/g, (c, i) =>
  i === 0 ? c.toUpperCase() : c,
);

const logsDir = path.join(process.cwd(), 'logs');

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  nestWinstonUtilities.format.nestLike(APP_LABEL, {
    colors: true,
    prettyPrint: true,
  }),
);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const errorTransport = new DailyRotateFile({
  dirname: path.join(logsDir, 'error'),
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: logFormat,
});

const combinedTransport = new DailyRotateFile({
  dirname: path.join(logsDir, 'combined'),
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

export const winstonLoggerConfig = {
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    errorTransport,
    combinedTransport,
  ],
};

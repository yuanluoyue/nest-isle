import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logsDir = path.join(process.cwd(), 'logs');

/** 结构化 JSON 格式 - 适配 Loki */
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/** 控制台彩色格式 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, module, action, traceId, userId, duration, ...rest }) => {
    const prefix = [
      timestamp,
      `[${level}]`,
      module ? `[${module}]` : '',
      action ? `[${action}]` : '',
      traceId ? `trace:${traceId}` : '',
    ].filter(Boolean).join(' ');

    const parts = [prefix, message];
    if (userId) parts.push(`user:${userId}`);
    if (duration !== undefined) parts.push(`${duration}ms`);
    const extra = Object.keys(rest).length ? JSON.stringify(rest) : '';
    if (extra) parts.push(extra);

    return parts.join(' ');
  }),
);

export function createLoggerTransports() {
  return [
    new winston.transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      dirname: path.join(logsDir, 'error'),
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
      format: structuredFormat,
    }),
    new DailyRotateFile({
      dirname: path.join(logsDir, 'combined'),
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: structuredFormat,
    }),
  ];
}

export function createWinstonConfig() {
  return { transports: createLoggerTransports() };
}

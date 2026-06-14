import { SetMetadata } from '@nestjs/common';

export const OPERATE_LOG_KEY = 'operate_log';

export interface OperateLogOptions {
  module: string;
  action: string;
}

export const OperateLog = (options: OperateLogOptions) =>
  SetMetadata(OPERATE_LOG_KEY, options);

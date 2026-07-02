import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  traceId: string;
  userId?: string;
  module?: string;
  action?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  return requestContextStorage.getStore() ?? { traceId: 'unknown' };
}

export function setRequestContext(ctx: Partial<RequestContext>): void {
  const current = requestContextStorage.getStore() ?? { traceId: 'unknown' };
  Object.assign(current, ctx);
}

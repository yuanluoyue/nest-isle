import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { LoggerService } from '../observability/logger/logger.service';

@Injectable()
export class WsService {
  private io: Server | null = null;
  private readonly logger: LoggerService;

  constructor(loggerService: LoggerService) {
    this.logger = loggerService.child('WebSocket');
  }

  setServer(server: Server) {
    this.io = server;
  }

  emitToUser(userId: string, event: string, data: unknown): boolean {
    if (!this.io) return false;
    this.io.to(`user:${userId}`).emit(event, data);
    this.logger.info({
      action: 'EmitToUser',
      message: 'Emit event to user',
      data: { userId, event },
    });
    return true;
  }

  emitToAll(event: string, data: unknown): boolean {
    if (!this.io) return false;
    this.io.emit(event, data);
    this.logger.info({
      action: 'Broadcast',
      message: 'Broadcast event',
      data: { event },
    });
    return true;
  }

  getServer(): Server | null {
    return this.io;
  }
}

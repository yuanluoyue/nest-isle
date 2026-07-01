import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class WsService {
  private io: Server | null = null;

  setServer(server: Server) {
    this.io = server;
  }

  emitToUser(userId: string, event: string, data: unknown): boolean {
    if (!this.io) return false;
    this.io.to(`user:${userId}`).emit(event, data);
    return true;
  }

  emitToAll(event: string, data: unknown): boolean {
    if (!this.io) return false;
    this.io.emit(event, data);
    return true;
  }

  getServer(): Server | null {
    return this.io;
  }
}

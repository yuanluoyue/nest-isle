import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsService } from './ws.service';
import { LoggerService } from '../observability/logger/logger.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notification',
})
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger: LoggerService;

  constructor(
    private wsService: WsService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService.child('WebSocket');
  }

  afterInit() {
    this.wsService.setServer(this.server);
    this.logger.info({
      action: 'GatewayStarted',
      message: 'WebSocket gateway started',
    });
  }

  handleConnection(client: Socket) {
    const userId =
      (client.handshake.auth?.userId as string | undefined) ||
      (client.handshake.query?.userId as string | undefined);
    if (userId) {
      void client.join(`user:${userId}`);
    }
    this.logger.info({
      action: 'Connected',
      message: 'Client connected',
      data: { userId, socketId: client.id },
    });
  }

  handleDisconnect(client: Socket) {
    // 用户断开连接时，Socket.io 自动清理房间
    this.logger.info({
      action: 'Disconnected',
      message: 'Client disconnected',
      data: { socketId: client.id },
    });
  }
}

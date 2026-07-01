import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsService } from './ws.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/notification',
})
export class WsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private wsService: WsService) {}

  afterInit() {
    this.wsService.setServer(this.server);
  }

  handleConnection(client: Socket) {
    const userId =
      (client.handshake.auth?.userId as string | undefined) ||
      (client.handshake.query?.userId as string | undefined);
    if (userId) {
      void client.join(`user:${userId}`);
    }
  }

  handleDisconnect() {
    // 用户断开连接时，Socket.io 自动清理房间
  }
}

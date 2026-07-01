import { Module, Global } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsGateway } from './ws.gateway';

@Global()
@Module({
  providers: [WsService, WsGateway],
  exports: [WsService],
})
export class GatewayModule {}

import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Server } from 'ws';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
  private logger: Logger = new Logger('SocketEventsGateway');
  private summaryClient: number = 0;

  afterInit(server: Server) {
    this.logger.log(`WebSocket server initialized total: ${this.summaryClient}`);
  }

  handleConnection(client: any, ...args: any[]) {
    this.summaryClient++;
    this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
  }

  handleDisconnect(client: any) {
    this.summaryClient--;
    this.logger.log(`== Client disconnected left total: ${this.summaryClient} ==`);
  }


  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}

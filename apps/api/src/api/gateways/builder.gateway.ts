import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/builder', cors: { origin: '*' } })
export class BuilderGateway {
  @WebSocketServer()
  server!: Server;

  // Helpers to emit to rooms
  emitToJob(jobId: string, event: string, payload: any) {
    this.server.to(`job:${jobId}`).emit(event, payload);
  }

  emitToManager(managerAddress: string, event: string, payload: any) {
    this.server.to(`manager:${managerAddress}`).emit(event, payload);
  }

  @SubscribeMessage('joinJob')
  handleJoinJob(@MessageBody() data: { jobId: string }, @ConnectedSocket() client: Socket) {
    client.join(`job:${data.jobId}`);
  }

  @SubscribeMessage('joinManager')
  handleJoinManager(@MessageBody() data: { managerAddress: string }, @ConnectedSocket() client: Socket) {
    client.join(`manager:${data.managerAddress}`);
  }
}



import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this properly in production
    credentials: true,
  },
  namespace: '/casino',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private readonly subscriptions = new Map<string, Set<string>>();

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Clean up subscriptions
    this.subscriptions.forEach((clients, room) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscriptions.delete(room);
      }
    });
  }

  /**
   * Subscribe to live trials for a specific casino
   */
  @SubscribeMessage('subscribeLiveTrials')
  handleSubscribeLiveTrials(
    @MessageBody() data: { casinoId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = data.casinoId ? `casino:${data.casinoId}` : 'global';
    
    client.join(room);
    
    if (!this.subscriptions.has(room)) {
      this.subscriptions.set(room, new Set());
    }
    this.subscriptions.get(room).add(client.id);
    
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    
    return { success: true, room };
  }

  /**
   * Unsubscribe from live trials
   */
  @SubscribeMessage('unsubscribeLiveTrials')
  handleUnsubscribeLiveTrials(
    @MessageBody() data: { casinoId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = data.casinoId ? `casino:${data.casinoId}` : 'global';
    
    client.leave(room);
    
    const roomClients = this.subscriptions.get(room);
    if (roomClients) {
      roomClients.delete(client.id);
      if (roomClients.size === 0) {
        this.subscriptions.delete(room);
      }
    }
    
    this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
    
    return { success: true, room };
  }

  /**
   * Subscribe to a specific player's trials
   */
  @SubscribeMessage('subscribePlayerTrials')
  handleSubscribePlayerTrials(
    @MessageBody() data: { address: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `player:${data.address}`;
    
    client.join(room);
    
    if (!this.subscriptions.has(room)) {
      this.subscriptions.set(room, new Set());
    }
    this.subscriptions.get(room).add(client.id);
    
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    
    return { success: true, room };
  }

  /**
   * Emit trial registered event
   */
  emitTrialRegistered(trial: any) {
    // Emit to global room
    this.server.to('global').emit('trialRegistered', trial);
    
    // Emit to casino-specific room
    if (trial.casinoId) {
      this.server.to(`casino:${trial.casinoId}`).emit('trialRegistered', trial);
    }
    
    // Emit to player-specific room
    if (trial.who) {
      this.server.to(`player:${trial.who}`).emit('trialRegistered', trial);
    }
    
    this.logger.debug(`Emitted trialRegistered for ${trial.id}`);
  }

  /**
   * Emit trial resolved event
   */
  emitTrialResolved(trial: any) {
    // Emit to global room
    this.server.to('global').emit('trialResolved', trial);
    
    // Emit to casino-specific room
    if (trial.casinoId) {
      this.server.to(`casino:${trial.casinoId}`).emit('trialResolved', trial);
    }
    
    // Emit to player-specific room
    if (trial.who) {
      this.server.to(`player:${trial.who}`).emit('trialResolved', trial);
    }
    
    this.logger.debug(`Emitted trialResolved for ${trial.id}`);
  }

  /**
   * Emit casino stats update
   */
  emitStatsUpdate(casinoId: string, stats: any) {
    this.server.to(`casino:${casinoId}`).emit('statsUpdate', stats);
    this.server.to('global').emit('statsUpdate', { casinoId, ...stats });
    
    this.logger.debug(`Emitted statsUpdate for casino ${casinoId}`);
  }
}


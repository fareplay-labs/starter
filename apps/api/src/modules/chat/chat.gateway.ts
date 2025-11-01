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
import { ChatService } from './chat.service';

interface SendMessageDto {
  message: string;
  userAddress: string; // From JWT in real impl, but simplified for now
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Chat client connected: ${client.id}`);
    // Auto-join global room
    client.join('global');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  /**
   * Send a chat message
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.sendMessage(
        data.userAddress,
        data.message,
      );

      // Broadcast to all clients in global chat
      this.server.to('global').emit('newMessage', message);

      this.logger.debug(`Message broadcast to global chat: ${message.id}`);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a message
   */
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; userAddress: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, data.userAddress);

      // Broadcast deletion to all clients
      this.server.to('global').emit('messageDeleted', { messageId: data.messageId });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete message: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Emit new message to global chat (called from service)
   */
  emitNewMessage(message: any) {
    this.server.to('global').emit('newMessage', message);
  }
}

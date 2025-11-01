import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Public } from '@/modules/auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get chat messages (global chat)
   * GET /api/chat?limit=50&before=2024-01-01T00:00:00.000Z
   */
  @Public() // Make public for now, can protect later
  @Get()
  async getMessages(
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const messages = await this.chatService.getMessages(limitNum, before);

    return {
      messages,
      hasMore: messages.length === limitNum,
    };
  }
}

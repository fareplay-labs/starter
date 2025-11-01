import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

interface CacheEntry {
  messages: any[];
  timestamp: number;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly CACHE_TTL = 30000; // 30 seconds
  private messageCache: CacheEntry | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send a chat message
   */
  async sendMessage(
    userAddress: string,
    message: string,
  ): Promise<any> {
    // Validate message
    if (!message || message.trim().length === 0) {
      throw new BadRequestException('Message cannot be empty');
    }

    if (message.length > this.MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message too long (max ${this.MAX_MESSAGE_LENGTH} characters)`,
      );
    }

    // Ensure user exists
    let user = await this.prisma.user.findUnique({
      where: { walletAddress: userAddress },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          walletAddress: userAddress,
        },
      });
      this.logger.log(`Created user ${userAddress}`);
    }

    // Create message
    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        userId: userAddress,
        message: message.trim(),
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(`Message sent by ${userAddress}`);

    // Invalidate cache
    this.messageCache = null;

    return this.formatMessage(chatMessage);
  }

  /**
   * Get chat messages (global chat)
   */
  async getMessages(
    limit: number = 50,
    before?: string, // cursor-based pagination
  ): Promise<any[]> {
    // Check cache only for recent messages without pagination
    if (!before && limit === 50) {
      const now = Date.now();
      if (this.messageCache && (now - this.messageCache.timestamp) < this.CACHE_TTL) {
        this.logger.debug('Returning cached messages');
        return this.messageCache.messages;
      }
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        deleted: false,
        ...(before && {
          createdAt: {
            lt: new Date(before),
          },
        }),
      },
      include: {
        user: {
          select: {
            walletAddress: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const formattedMessages = messages.map((m) => this.formatMessage(m)).reverse();

    // Cache only recent messages without pagination
    if (!before && limit === 50) {
      this.messageCache = {
        messages: formattedMessages,
        timestamp: Date.now(),
      };
      this.logger.debug('Cached messages');
    }

    return formattedMessages;
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userAddress: string): Promise<void> {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { user: true },
    });

    if (!message) {
      throw new BadRequestException('Message not found');
    }

    // Only allow user to delete their own messages
    if (message.user.walletAddress !== userAddress) {
      throw new BadRequestException('Cannot delete another user\'s message');
    }

    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        deleted: true,
        deletedAt: new Date(),
      },
    });

    // Invalidate cache
    this.messageCache = null;

    this.logger.log(`Message ${messageId} deleted by ${userAddress}`);
  }

  /**
   * Format message for API response
   */
  private formatMessage(message: any) {
    return {
      id: message.id,
      message: message.message,
      createdAt: message.createdAt.toISOString(),
      deleted: message.deleted,
      user: {
        address: message.user.walletAddress,
        username: message.user.username,
        avatarUrl: message.user.avatarUrl,
      },
    };
  }
}

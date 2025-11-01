import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Queue names used across the application
 */
export const QUEUE_NAMES = {
  BLOCKCHAIN_EVENT: 'blockchain-event',
  EVENT_INTERPRETATION: 'event-interpretation',
  GAME: 'game',
  BUILDER_DESIGN: 'builder-design',
  BUILDER_ELEMENT: 'builder-element',
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          // Parse REDIS_URL if provided (format: redis://[user:password@]host:port)
          ...(configService.get('REDIS_URL') && parseRedisUrl(configService.get('REDIS_URL'))),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 1000, // Keep last 1000 completed jobs
          removeOnFail: 5000, // Keep last 5000 failed jobs
        },
      }),
      inject: [ConfigService],
    }),
    // Register all queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BLOCKCHAIN_EVENT },
      { name: QUEUE_NAMES.EVENT_INTERPRETATION },
      { name: QUEUE_NAMES.GAME },
      { name: QUEUE_NAMES.BUILDER_DESIGN },
      { name: QUEUE_NAMES.BUILDER_ELEMENT },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}

/**
 * Parse Redis URL into connection options
 */
function parseRedisUrl(url: string): { host: string; port: number; password?: string } | null {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '6379', 10),
      password: parsedUrl.password || undefined,
    };
  } catch (error) {
    return null;
  }
}


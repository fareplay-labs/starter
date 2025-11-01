import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';
import { Public } from '@/modules/auth/jwt-auth.guard';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.BLOCKCHAIN_EVENT)
    private readonly blockchainQueue: Queue,
    @InjectQueue(QUEUE_NAMES.EVENT_INTERPRETATION)
    private readonly interpretationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.GAME)
    private readonly gameQueue: Queue,
  ) {}

  /**
   * Health check endpoint
   * GET /api/health
   */
  @Get()
  async health() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'unknown',
      redis: 'unknown',
      queues: {
        blockchainEvent: 'unknown',
        eventInterpretation: 'unknown',
        game: 'unknown',
      },
    };

    // Check database connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      checks.status = 'error';
    }

    // Check Redis/Queue connection
    try {
      const blockchainQueueClient = await this.blockchainQueue.client;
      await blockchainQueueClient.ping();
      checks.redis = 'connected';

      // Get queue stats
      const [
        blockchainWaiting,
        blockchainActive,
        interpretationWaiting,
        interpretationActive,
        gameWaiting,
        gameActive,
      ] = await Promise.all([
        this.blockchainQueue.getWaitingCount(),
        this.blockchainQueue.getActiveCount(),
        this.interpretationQueue.getWaitingCount(),
        this.interpretationQueue.getActiveCount(),
        this.gameQueue.getWaitingCount(),
        this.gameQueue.getActiveCount(),
      ]);

      checks.queues = {
        blockchainEvent: `waiting: ${blockchainWaiting}, active: ${blockchainActive}`,
        eventInterpretation: `waiting: ${interpretationWaiting}, active: ${interpretationActive}`,
        game: `waiting: ${gameWaiting}, active: ${gameActive}`,
      };
    } catch (error) {
      checks.redis = 'disconnected';
      checks.status = 'error';
    }

    return checks;
  }

  /**
   * Readiness check (for k8s/fly.io)
   * GET /api/health/ready
   */
  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const blockchainQueueClient = await this.blockchainQueue.client;
      await blockchainQueueClient.ping();
      
      return { status: 'ready' };
    } catch (error) {
      return { status: 'not ready', error: error.message };
    }
  }

  /**
   * Liveness check (for k8s/fly.io)
   * GET /api/health/live
   */
  @Get('live')
  async live() {
    return { status: 'alive' };
  }
}


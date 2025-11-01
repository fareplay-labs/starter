import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { toDecimalString } from '@/common/utils/decimal.utils';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Injectable()
export class EventInterpretationService {
  private readonly logger = new Logger(EventInterpretationService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.GAME) private readonly gameQueue: Queue,
  ) {}

  /**
   * Interpret PoolRegistered event into Pool domain model
   */
  async interpretPoolRegistered(orderIndex: string): Promise<void> {
    const event = await this.prisma.poolRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (!event) {
      throw new Error(`PoolRegisteredEvent not found: ${orderIndex}`);
    }

    // Check if already interpreted
    const existing = await this.prisma.poolRegistered.findUnique({
      where: { id: orderIndex },
    });

    if (existing) {
      this.logger.debug(`PoolRegistered ${orderIndex} already interpreted`);
      return;
    }

    // Create PoolRegistered domain model (unchecked - id is the foreign key)
    await this.prisma.poolRegistered.create({
      data: {
        id: orderIndex,
        poolAddress: event.poolAddress,
        managerAddress: event.managerAddress,
      },
    });

    // Create Pool
    const poolExists = await this.prisma.pool.findUnique({
      where: { address: event.poolAddress },
    });

    if (!poolExists) {
      await this.prisma.pool.create({
        data: {
          address: event.poolAddress,
        },
      });
      this.logger.log(`Created Pool ${event.poolAddress}`);
    }

    this.logger.log(`Interpreted PoolRegistered ${orderIndex}`);
  }

  /**
   * Interpret QkWithConfigRegistered event
   */
  async interpretQkWithConfigRegistered(orderIndex: string): Promise<void> {
    const event = await this.prisma.qkWithConfigRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (!event) {
      throw new Error(`QkWithConfigRegisteredEvent not found: ${orderIndex}`);
    }

    const existing = await this.prisma.qkWithConfigRegistered.findUnique({
      where: { id: orderIndex },
    });

    if (existing) {
      this.logger.debug(`QkWithConfigRegistered ${orderIndex} already interpreted`);
      return;
    }

    await this.prisma.qkWithConfigRegistered.create({
      data: {
        id: orderIndex,
        qkWithConfigHash: event.qkWithConfigHash,
      },
    });

    this.logger.log(`Interpreted QkWithConfigRegistered ${orderIndex}`);
  }

  /**
   * Interpret TrialRegistered event into Trial domain model
   */
  async interpretTrialRegistered(orderIndex: string): Promise<void> {
    const event = await this.prisma.trialRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (!event) {
      throw new Error(`TrialRegisteredEvent not found: ${orderIndex}`);
    }

    // Check if already interpreted
    const existing = await this.prisma.trialRegistered.findUnique({
      where: { id: orderIndex },
    });

    if (existing) {
      this.logger.debug(`TrialRegistered ${orderIndex} already interpreted`);
      return;
    }

    // Verify dependencies exist
    const pool = await this.prisma.pool.findUnique({
      where: { address: event.poolAddress },
    });

    if (!pool) {
      throw new Error(
        `Pool ${event.poolAddress} not found - trying to process TrialRegistered before pool creation`,
      );
    }

    const qkConfig = await this.prisma.qkWithConfigRegistered.findUnique({
      where: { qkWithConfigHash: event.qkWithConfigHash },
    });

    if (!qkConfig) {
      throw new Error(
        `QkWithConfigRegistered ${event.qkWithConfigHash} not found`,
      );
    }

    // Create TrialRegistered domain model
    await this.prisma.trialRegistered.create({
      data: {
        id: orderIndex,
        trialId: event.trialId,
      },
    });

    // Create Trial
    const trialExists = await this.prisma.trial.findUnique({
      where: { id: event.trialId },
    });

    if (!trialExists) {
      // Determine casinoId (if applicable)
      // For now, we'll leave it null - this can be set based on your business logic
      await this.prisma.trial.create({
        data: {
          id: event.trialId,
          poolAddress: event.poolAddress,
          who: event.who,
          qkWithConfigHash: event.qkWithConfigHash,
          extraDataHash: event.extraDataHash,
        },
      });

      this.logger.log(`Created Trial ${event.trialId}`);
    }

    // Queue game instance creation
    await this.gameQueue.add('createGameInstance', {
      trialId: event.trialId,
    });

    this.logger.log(`Interpreted TrialRegistered ${orderIndex}`);
  }

  /**
   * Interpret TrialResolved event
   */
  async interpretTrialResolved(orderIndex: string): Promise<void> {
    const event = await this.prisma.trialResolvedEvent.findUnique({
      where: { orderIndex },
    });

    if (!event) {
      throw new Error(`TrialResolvedEvent not found: ${orderIndex}`);
    }

    const existing = await this.prisma.trialResolved.findUnique({
      where: { id: orderIndex },
    });

    if (existing) {
      this.logger.debug(`TrialResolved ${orderIndex} already interpreted`);
      return;
    }

    // Verify trial exists
    const trial = await this.prisma.trial.findUnique({
      where: { id: event.trialId },
    });

    if (!trial) {
      throw new Error(
        `Trial ${event.trialId} not found - trying to resolve non-existent trial`,
      );
    }

    await this.prisma.trialResolved.create({
      data: {
        id: orderIndex,
        trialId: event.trialId,
      },
    });

    // Queue game instance resolution
    await this.gameQueue.add('resolveGameInstance', {
      trialId: event.trialId,
      resultIndex: event.resultIndex,
    });

    this.logger.log(`Interpreted TrialResolved ${orderIndex}`);
  }

  /**
   * Interpret FeeCharged event
   */
  async interpretFeeCharged(orderIndex: string): Promise<void> {
    const event = await this.prisma.feeChargedEvent.findUnique({
      where: { orderIndex },
    });

    if (!event) {
      throw new Error(`FeeChargedEvent not found: ${orderIndex}`);
    }

    const existing = await this.prisma.feeCharged.findUnique({
      where: { id: orderIndex },
    });

    if (existing) {
      this.logger.debug(`FeeCharged ${orderIndex} already interpreted`);
      return;
    }

    // Verify trial exists
    const trial = await this.prisma.trial.findUnique({
      where: { id: event.trialId },
    });

    if (!trial) {
      throw new Error(
        `Trial ${event.trialId} not found for FeeCharged event`,
      );
    }

    // Create FeeCharged
    await this.prisma.feeCharged.create({
      data: {
        id: orderIndex,
      },
    });

    // Create Fee domain model
    const feeExists = await this.prisma.fee.findUnique({
      where: { id: orderIndex },
    });

    if (!feeExists) {
      // For simplicity, we'll use basic fee distribution
      // You can customize this based on your business logic
      const feeAmount = BigInt(event.feeAmount.toString());
      const hostAmount = (feeAmount * BigInt(50)) / BigInt(100); // 50%
      const poolAmount = (feeAmount * BigInt(50)) / BigInt(100); // 50%

      await this.prisma.fee.create({
        data: {
          id: orderIndex,
          poolAddress: event.poolAddress,
          trialId: event.trialId,
          hostPercent: toDecimalString(50),
          poolPercent: toDecimalString(50),
          hostAmount: toDecimalString(hostAmount),
          poolAmount: toDecimalString(poolAmount),
        },
      });

      this.logger.log(`Created Fee ${orderIndex}`);
    }

    this.logger.log(`Interpreted FeeCharged ${orderIndex}`);
  }
}


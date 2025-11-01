import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { TypedEvent, FareProtocolEvent } from '@/modules/solana/interfaces/events.interface';
import { toDecimalString, calculateOrderIndex } from '@/common/utils/decimal.utils';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Injectable()
export class BlockchainEventService {
  private readonly logger = new Logger(BlockchainEventService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.EVENT_INTERPRETATION)
    private readonly interpretationQueue: Queue,
  ) {}

  /**
   * Store blockchain events in database and queue for interpretation
   */
  async storeEvents(events: TypedEvent[]): Promise<void> {
    for (const typedEvent of events) {
      try {
        await this.storeEvent(typedEvent);
      } catch (error) {
        this.logger.error(
          `Failed to store ${typedEvent.eventType} event: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
  }

  /**
   * Store a single event and queue for interpretation
   */
  private async storeEvent(typedEvent: TypedEvent): Promise<void> {
    const { eventType, event } = typedEvent;

    const orderIndex = calculateOrderIndex(
      event.slot,
      event.instructionIndex,
      event.innerInstructionIndex,
    );

    this.logger.debug(
      `Storing ${eventType} event - Order: ${orderIndex}, Sig: ${event.signature}`,
    );

    switch (eventType) {
      case 'PoolRegistered':
        await this.storePoolRegistered(event as any, orderIndex);
        break;
      
      case 'QkWithConfigRegistered':
        await this.storeQkWithConfigRegistered(event as any, orderIndex);
        break;
      
      case 'TrialRegistered':
        await this.storeTrialRegistered(event as any, orderIndex);
        break;
      
      case 'TrialResolved':
        await this.storeTrialResolved(event as any, orderIndex);
        break;
      
      case 'FeeCharged':
        await this.storeFeeCharged(event as any, orderIndex);
        break;
      
      default:
        this.logger.warn(`Unknown event type: ${eventType}`);
    }
  }

  /**
   * Store PoolRegistered event
   */
  private async storePoolRegistered(event: any, orderIndex: string): Promise<void> {
    // Check if already exists
    const existing = await this.prisma.poolRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (existing) {
      this.logger.debug(`PoolRegistered event ${orderIndex} already exists, skipping`);
      return;
    }

    await this.prisma.poolRegisteredEvent.create({
      data: {
        orderIndex,
        slot: toDecimalString(event.slot),
        instructionIndex: event.instructionIndex,
        innerInstructionIndex: event.innerInstructionIndex,
        signature: event.signature,
        blockTime: event.blockTime,
        poolAddress: event.poolAddress,
        managerAddress: event.managerAddress,
        feePlayMultiplier: toDecimalString(event.feePlayMultiplier),
        feeLossMultiplier: toDecimalString(event.feeLossMultiplier),
        feeMintMultiplier: toDecimalString(event.feeMintMultiplier),
        feeHostPercent: toDecimalString(event.feeHostPercent),
        feePoolPercent: toDecimalString(event.feePoolPercent),
        minLimitForTicket: toDecimalString(event.minLimitForTicket),
        probability: toDecimalString(event.probability),
      },
    });

    // Queue for interpretation
    await this.interpretationQueue.add('interpretPoolRegistered', {
      orderIndex,
    });

    this.logger.log(`Stored PoolRegistered event ${orderIndex}`);
  }

  /**
   * Store QkWithConfigRegistered event
   */
  private async storeQkWithConfigRegistered(event: any, orderIndex: string): Promise<void> {
    const existing = await this.prisma.qkWithConfigRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (existing) {
      this.logger.debug(`QkWithConfigRegistered event ${orderIndex} already exists, skipping`);
      return;
    }

    await this.prisma.qkWithConfigRegisteredEvent.create({
      data: {
        orderIndex,
        slot: toDecimalString(event.slot),
        instructionIndex: event.instructionIndex,
        innerInstructionIndex: event.innerInstructionIndex,
        signature: event.signature,
        blockTime: event.blockTime,
        qkWithConfigHash: event.qkWithConfigHash,
        q: event.q.map(toDecimalString),
        k: event.k.map(toDecimalString),
        feeLossMultiplier: toDecimalString(event.feeLossMultiplier),
        feeMintMultiplier: toDecimalString(event.feeMintMultiplier),
        effectiveEv: toDecimalString(event.effectiveEv),
      },
    });

    await this.interpretationQueue.add('interpretQkWithConfigRegistered', {
      orderIndex,
    });

    this.logger.log(`Stored QkWithConfigRegistered event ${orderIndex}`);
  }

  /**
   * Store TrialRegistered event
   */
  private async storeTrialRegistered(event: any, orderIndex: string): Promise<void> {
    const existing = await this.prisma.trialRegisteredEvent.findUnique({
      where: { orderIndex },
    });

    if (existing) {
      this.logger.debug(`TrialRegistered event ${orderIndex} already exists, skipping`);
      return;
    }

    await this.prisma.trialRegisteredEvent.create({
      data: {
        orderIndex,
        slot: toDecimalString(event.slot),
        instructionIndex: event.instructionIndex,
        innerInstructionIndex: event.innerInstructionIndex,
        signature: event.signature,
        blockTime: event.blockTime,
        trialId: event.trialId,
        who: event.who,
        poolAddress: event.poolAddress,
        multiplier: toDecimalString(event.multiplier),
        qkWithConfigHash: event.qkWithConfigHash,
        vrfCostInFare: toDecimalString(event.vrfCostInFare),
        extraDataHash: event.extraDataHash,
      },
    });

    await this.interpretationQueue.add('interpretTrialRegistered', {
      orderIndex,
    });

    this.logger.log(`Stored TrialRegistered event ${orderIndex}`);
  }

  /**
   * Store TrialResolved event
   */
  private async storeTrialResolved(event: any, orderIndex: string): Promise<void> {
    const existing = await this.prisma.trialResolvedEvent.findUnique({
      where: { orderIndex },
    });

    if (existing) {
      this.logger.debug(`TrialResolved event ${orderIndex} already exists, skipping`);
      return;
    }

    await this.prisma.trialResolvedEvent.create({
      data: {
        orderIndex,
        slot: toDecimalString(event.slot),
        instructionIndex: event.instructionIndex,
        innerInstructionIndex: event.innerInstructionIndex,
        signature: event.signature,
        blockTime: event.blockTime,
        trialId: event.trialId,
        resultIndex: event.resultIndex,
        randomness: toDecimalString(event.randomness),
      },
    });

    await this.interpretationQueue.add('interpretTrialResolved', {
      orderIndex,
    });

    this.logger.log(`Stored TrialResolved event ${orderIndex}`);
  }

  /**
   * Store FeeCharged event
   */
  private async storeFeeCharged(event: any, orderIndex: string): Promise<void> {
    const existing = await this.prisma.feeChargedEvent.findUnique({
      where: { orderIndex },
    });

    if (existing) {
      this.logger.debug(`FeeCharged event ${orderIndex} already exists, skipping`);
      return;
    }

    await this.prisma.feeChargedEvent.create({
      data: {
        orderIndex,
        slot: toDecimalString(event.slot),
        instructionIndex: event.instructionIndex,
        innerInstructionIndex: event.innerInstructionIndex,
        signature: event.signature,
        blockTime: event.blockTime,
        feeType: event.feeType,
        poolAddress: event.poolAddress,
        trialId: event.trialId,
        feeAmount: toDecimalString(event.feeAmount),
      },
    });

    await this.interpretationQueue.add('interpretFeeCharged', {
      orderIndex,
    });

    this.logger.log(`Stored FeeCharged event ${orderIndex}`);
  }
}


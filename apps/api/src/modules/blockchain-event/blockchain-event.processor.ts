import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BlockchainEventService } from './blockchain-event.service';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';
import { TypedEvent } from '@/modules/solana/interfaces/events.interface';

interface ProcessTransactionJob {
  signature: string;
  events: TypedEvent[];
}

@Processor(QUEUE_NAMES.BLOCKCHAIN_EVENT)
export class BlockchainEventProcessor extends WorkerHost {
  private readonly logger = new Logger(BlockchainEventProcessor.name);

  constructor(private readonly blockchainEventService: BlockchainEventService) {
    super();
  }

  async process(job: Job<ProcessTransactionJob>): Promise<void> {
    const { signature, events } = job.data;

    this.logger.log(
      `Processing transaction ${signature} with ${events.length} events`,
    );

    try {
      await this.blockchainEventService.storeEvents(events);
      this.logger.log(`Successfully processed transaction ${signature}`);
    } catch (error) {
      this.logger.error(
        `Failed to process transaction ${signature}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retries
    }
  }
}


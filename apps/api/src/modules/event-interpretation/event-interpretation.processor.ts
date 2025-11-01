import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventInterpretationService } from './event-interpretation.service';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Processor(QUEUE_NAMES.EVENT_INTERPRETATION)
export class EventInterpretationProcessor extends WorkerHost {
  private readonly logger = new Logger(EventInterpretationProcessor.name);

  constructor(
    private readonly eventInterpretationService: EventInterpretationService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { orderIndex } = job.data;

    this.logger.debug(`Processing ${job.name} - Order: ${orderIndex}`);

    try {
      switch (job.name) {
        case 'interpretPoolRegistered':
          await this.eventInterpretationService.interpretPoolRegistered(orderIndex);
          break;

        case 'interpretQkWithConfigRegistered':
          await this.eventInterpretationService.interpretQkWithConfigRegistered(orderIndex);
          break;

        case 'interpretTrialRegistered':
          await this.eventInterpretationService.interpretTrialRegistered(orderIndex);
          break;

        case 'interpretTrialResolved':
          await this.eventInterpretationService.interpretTrialResolved(orderIndex);
          break;

        case 'interpretFeeCharged':
          await this.eventInterpretationService.interpretFeeCharged(orderIndex);
          break;

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }

      this.logger.log(`Successfully processed ${job.name} - Order: ${orderIndex}`);
    } catch (error) {
      this.logger.error(
        `Failed to process ${job.name} - Order: ${orderIndex}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retries
    }
  }
}


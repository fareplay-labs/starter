import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { GameService } from './game.service';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Processor(QUEUE_NAMES.GAME)
export class GameProcessor extends WorkerHost {
  private readonly logger = new Logger(GameProcessor.name);

  constructor(private readonly gameService: GameService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`Processing ${job.name} - Job ID: ${job.id}`);

    try {
      switch (job.name) {
        case 'createGameInstance':
          await this.gameService.createGameInstance(job.data.trialId);
          break;

        case 'resolveGameInstance':
          await this.gameService.resolveGameInstance(
            job.data.trialId,
            job.data.resultIndex,
          );
          break;

        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }

      this.logger.log(`Successfully processed ${job.name} - Job ID: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process ${job.name} - Job ID: ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error; // Let BullMQ handle retries
    }
  }
}


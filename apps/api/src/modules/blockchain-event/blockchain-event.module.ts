import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BlockchainEventService } from './blockchain-event.service';
import { BlockchainEventProcessor } from './blockchain-event.processor';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.BLOCKCHAIN_EVENT }),
    BullModule.registerQueue({ name: QUEUE_NAMES.EVENT_INTERPRETATION }),
  ],
  providers: [BlockchainEventService, BlockchainEventProcessor],
  exports: [BlockchainEventService],
})
export class BlockchainEventModule {}


import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EventInterpretationService } from './event-interpretation.service';
import { EventInterpretationProcessor } from './event-interpretation.processor';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.EVENT_INTERPRETATION }),
    BullModule.registerQueue({ name: QUEUE_NAMES.GAME }),
  ],
  providers: [EventInterpretationService, EventInterpretationProcessor],
  exports: [EventInterpretationService],
})
export class EventInterpretationModule {}


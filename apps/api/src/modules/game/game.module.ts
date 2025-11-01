import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { GameService } from './game.service';
import { GameProcessor } from './game.processor';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NAMES.GAME })],
  providers: [GameService, GameProcessor],
  exports: [GameService],
})
export class GameModule {}


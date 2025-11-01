import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { QueueModule, QUEUE_NAMES } from '@/modules/queue/queue.module';
import { BuilderController } from './builder.controller';
import { BuilderService } from './builder.service';
import { OpenAiProvider } from './openai.provider';
import { SchemaRegistryService } from './schema-registry.service';
import { OrchestratorService } from './orchestrator.service';
import { MediaStorageService } from './media-storage.service';
import { BuilderDesignProcessor } from './builder.design.processor';
import { BuilderElementProcessor } from './builder.element.processor';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { AIGenerationService } from './ai-generation.service';
import { AIImageGenerationService } from './ai-image.service';
import { AIGameDesignService } from './ai-game-design.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    QueueModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.BUILDER_DESIGN },
      { name: QUEUE_NAMES.BUILDER_ELEMENT },
    ),
  ],
  controllers: [BuilderController],
  providers: [
    BuilderService,
    OpenAiProvider,
    AIGenerationService,
    AIImageGenerationService,
    AIGameDesignService,
    SchemaRegistryService,
    OrchestratorService,
    MediaStorageService,
    BuilderDesignProcessor,
    BuilderElementProcessor,
    BuilderGateway,
  ],
  exports: [BuilderService],
})
export class BuilderModule {}



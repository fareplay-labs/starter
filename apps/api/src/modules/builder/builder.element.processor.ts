import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { AIGenerationService } from './ai-generation.service';
import { AIImageGenerationService } from './ai-image.service';

@Processor(QUEUE_NAMES.BUILDER_ELEMENT)
export class BuilderElementProcessor extends WorkerHost {
  private readonly logger = new Logger(BuilderElementProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BuilderGateway,
    private readonly gen: AIGenerationService,
    private readonly imageGen: AIImageGenerationService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const jobId: string = job.data.jobId;
    this.logger.debug(`Processing element job ${jobId}`);
    try {
      await this.prisma.elementGenerationJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', progress: 10 },
      });
      this.gateway.emitToJob(jobId, 'builder:jobStarted', { jobId });

      // Load job to determine prompts/context
      const ej = await this.prisma.elementGenerationJob.findUnique({ where: { id: jobId } });
      const userAddress = ej?.userAddress;
      const gameType = ej?.gameType || 'generic';
      const prompt = ej?.finalPrompt || ej?.userPrompt || 'Generate a themed asset';

      // Generate one asset for now; can be extended to multiple types
      const imageUrl = await this.imageGen.generateAsset(jobId, userAddress, prompt, `builder/elements/${gameType}`);

      await this.prisma.elementGenerationJob.update({
        where: { id: jobId },
        data: { status: 'COMPLETE', progress: 100, result: { images: [imageUrl] }, completedAt: new Date() },
      });
      this.gateway.emitToJob(jobId, 'builder:preview', { jobId, element: { gameType, imageUrl } });
      this.gateway.emitToJob(jobId, 'builder:jobSucceeded', { jobId, result: { images: [imageUrl] } });
    } catch (err: any) {
      this.logger.error(`Element job failed ${jobId}: ${err.message}`);
      await this.prisma.elementGenerationJob.update({
        where: { id: jobId },
        data: { status: 'ERROR', error: String(err?.message || err) },
      });
      this.gateway.emitToJob(jobId, 'builder:jobFailed', { jobId, error: String(err?.message || err) });
      throw err;
    }
  }
}



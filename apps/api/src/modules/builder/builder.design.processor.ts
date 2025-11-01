import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { OrchestratorService } from './orchestrator.service';

@Processor(QUEUE_NAMES.BUILDER_DESIGN)
export class BuilderDesignProcessor extends WorkerHost {
  private readonly logger = new Logger(BuilderDesignProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: BuilderGateway,
    private readonly orchestrator: OrchestratorService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const jobId: string = job.data.jobId;
    this.logger.debug(`Processing design job ${jobId}`);
    try {
      await this.orchestrator.executeDesign(jobId);
    } catch (err: any) {
      this.logger.error(`Design job failed ${jobId}: ${err.message}`);
      await this.prisma.casinoDesignJob.update({
        where: { id: jobId },
        data: { status: 'ERROR', error: String(err?.message || err) },
      });
      this.gateway.emitToJob(jobId, 'builder:jobFailed', { jobId, error: String(err?.message || err) });
      throw err;
    }
  }
}



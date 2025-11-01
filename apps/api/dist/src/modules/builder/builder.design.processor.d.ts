import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { OrchestratorService } from './orchestrator.service';
export declare class BuilderDesignProcessor extends WorkerHost {
    private readonly prisma;
    private readonly gateway;
    private readonly orchestrator;
    private readonly logger;
    constructor(prisma: PrismaService, gateway: BuilderGateway, orchestrator: OrchestratorService);
    process(job: Job): Promise<void>;
}

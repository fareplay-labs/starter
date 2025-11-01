import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { AIGenerationService } from './ai-generation.service';
import { AIImageGenerationService } from './ai-image.service';
export declare class BuilderElementProcessor extends WorkerHost {
    private readonly prisma;
    private readonly gateway;
    private readonly gen;
    private readonly imageGen;
    private readonly logger;
    constructor(prisma: PrismaService, gateway: BuilderGateway, gen: AIGenerationService, imageGen: AIImageGenerationService);
    process(job: Job): Promise<void>;
}

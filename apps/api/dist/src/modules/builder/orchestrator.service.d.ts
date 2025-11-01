import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { SchemaRegistryService } from './schema-registry.service';
import { AIGenerationService } from './ai-generation.service';
import { AIImageGenerationService } from './ai-image.service';
import { AIGameDesignService } from './ai-game-design.service';
export declare class OrchestratorService {
    private readonly prisma;
    private readonly config;
    private readonly gateway;
    private readonly registry;
    private readonly gen;
    private readonly imageGen;
    private readonly gameDesign;
    private readonly logger;
    private static readonly Step;
    constructor(prisma: PrismaService, config: ConfigService, gateway: BuilderGateway, registry: SchemaRegistryService, gen: AIGenerationService, imageGen: AIImageGenerationService, gameDesign: AIGameDesignService);
    executeDesign(jobId: string): Promise<void>;
    private resolveImagePlaceholders;
}

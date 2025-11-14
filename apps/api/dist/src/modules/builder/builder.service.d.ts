import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Queue } from 'bullmq';
export declare class BuilderService {
    private readonly prisma;
    private readonly config;
    private readonly designQueue;
    private readonly elementQueue;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, designQueue: Queue, elementQueue: Queue);
    createDesignJob(casinoName: string, prompt: string, options?: any): Promise<any>;
    createElementJob(gameType: string, prompt: string, parameterId?: string, options?: any): Promise<any>;
    listJobs(type?: 'design' | 'element', limit?: number, offset?: number): Promise<{
        rows: any;
        total: any;
        limit: number;
        offset: number;
    }>;
    getJob(id: string): Promise<any>;
    applyDesign(jobId: string): Promise<{
        applied: boolean;
        settings: any;
    }>;
}

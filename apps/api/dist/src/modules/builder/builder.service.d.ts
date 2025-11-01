import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
export declare class BuilderService {
    private readonly prisma;
    private readonly config;
    private readonly designQueue;
    private readonly elementQueue;
    private readonly logger;
    constructor(prisma: PrismaService, config: ConfigService, designQueue: Queue, elementQueue: Queue);
    createDesignJob(casinoName: string, prompt: string, options?: any): Promise<{
        error: string | null;
        updatedAt: Date;
        result: Prisma.JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: Prisma.JsonValue;
        casinoName: string;
        userPrompt: string;
        poolId: number | null;
        currentStep: string | null;
        stepResults: Prisma.JsonValue;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
    }>;
    createElementJob(gameType: string, prompt: string, parameterId?: string, options?: any): Promise<{
        error: string | null;
        updatedAt: Date;
        result: Prisma.JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: Prisma.JsonValue;
        userPrompt: string;
        currentStep: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
        gameType: string;
        parameterId: string | null;
        finalPrompt: string;
    }>;
    listJobs(type?: 'design' | 'element', limit?: number, offset?: number): Promise<{
        rows: {
            error: string | null;
            updatedAt: Date;
            result: Prisma.JsonValue | null;
            id: string;
            progress: number;
            status: import(".prisma/client").$Enums.JobStatus;
            config: Prisma.JsonValue;
            userPrompt: string;
            currentStep: string | null;
            startedAt: Date;
            completedAt: Date | null;
            userAddress: string;
            gameType: string;
            parameterId: string | null;
            finalPrompt: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    } | {
        rows: {
            error: string | null;
            updatedAt: Date;
            result: Prisma.JsonValue | null;
            id: string;
            progress: number;
            status: import(".prisma/client").$Enums.JobStatus;
            config: Prisma.JsonValue;
            casinoName: string;
            userPrompt: string;
            poolId: number | null;
            currentStep: string | null;
            stepResults: Prisma.JsonValue;
            startedAt: Date;
            completedAt: Date | null;
            userAddress: string;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    getJob(id: string): Promise<({
        generatedImages: {
            createdAt: Date;
            id: string;
            userAddress: string;
            jobId: string | null;
            elementJobId: string | null;
            prompt: string;
            imageUrl: string;
            s3Key: string;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        error: string | null;
        updatedAt: Date;
        result: Prisma.JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: Prisma.JsonValue;
        casinoName: string;
        userPrompt: string;
        poolId: number | null;
        currentStep: string | null;
        stepResults: Prisma.JsonValue;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
    }) | ({
        generatedImages: {
            createdAt: Date;
            id: string;
            userAddress: string;
            jobId: string | null;
            elementJobId: string | null;
            prompt: string;
            imageUrl: string;
            s3Key: string;
            metadata: Prisma.JsonValue | null;
        }[];
    } & {
        error: string | null;
        updatedAt: Date;
        result: Prisma.JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: Prisma.JsonValue;
        userPrompt: string;
        currentStep: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
        gameType: string;
        parameterId: string | null;
        finalPrompt: string;
    })>;
    applyDesign(jobId: string): Promise<{
        applied: boolean;
        settings: {
            name: string;
            createdAt: Date;
            updatedAt: Date;
            poolAddress: string | null;
            id: string;
            shortDescription: string | null;
            longDescription: string | null;
            logoUrl: string | null;
            bannerUrl: string | null;
            primaryColor: string | null;
            theme: Prisma.JsonValue | null;
            status: import(".prisma/client").$Enums.CasinoStatus;
            websiteUrl: string | null;
            socialLinks: Prisma.JsonValue | null;
            registeredCasinoId: string | null;
            registeredPublicKey: string | null;
            registeredAt: Date | null;
        };
    }>;
}

import { BuilderService } from './builder.service';
export declare class BuilderController {
    private readonly builderService;
    constructor(builderService: BuilderService);
    createDesignJob(body: {
        casinoName: string;
        prompt: string;
        options?: any;
    }): Promise<{
        error: string | null;
        updatedAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: import("@prisma/client/runtime/library").JsonValue;
        casinoName: string;
        userPrompt: string;
        poolId: number | null;
        currentStep: string | null;
        stepResults: import("@prisma/client/runtime/library").JsonValue;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
    }>;
    createElementJob(body: {
        gameType: string;
        prompt: string;
        parameterId?: string;
        options?: any;
    }): Promise<{
        error: string | null;
        updatedAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: import("@prisma/client/runtime/library").JsonValue;
        userPrompt: string;
        currentStep: string | null;
        startedAt: Date;
        completedAt: Date | null;
        userAddress: string;
        gameType: string;
        parameterId: string | null;
        finalPrompt: string;
    }>;
    listJobs(type?: 'design' | 'element', limit?: string, offset?: string): Promise<{
        rows: {
            error: string | null;
            updatedAt: Date;
            result: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            progress: number;
            status: import(".prisma/client").$Enums.JobStatus;
            config: import("@prisma/client/runtime/library").JsonValue;
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
            result: import("@prisma/client/runtime/library").JsonValue | null;
            id: string;
            progress: number;
            status: import(".prisma/client").$Enums.JobStatus;
            config: import("@prisma/client/runtime/library").JsonValue;
            casinoName: string;
            userPrompt: string;
            poolId: number | null;
            currentStep: string | null;
            stepResults: import("@prisma/client/runtime/library").JsonValue;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        error: string | null;
        updatedAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: import("@prisma/client/runtime/library").JsonValue;
        casinoName: string;
        userPrompt: string;
        poolId: number | null;
        currentStep: string | null;
        stepResults: import("@prisma/client/runtime/library").JsonValue;
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
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        error: string | null;
        updatedAt: Date;
        result: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        progress: number;
        status: import(".prisma/client").$Enums.JobStatus;
        config: import("@prisma/client/runtime/library").JsonValue;
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
            theme: import("@prisma/client/runtime/library").JsonValue | null;
            status: import(".prisma/client").$Enums.CasinoStatus;
            websiteUrl: string | null;
            socialLinks: import("@prisma/client/runtime/library").JsonValue | null;
            registeredCasinoId: string | null;
            registeredPublicKey: string | null;
            registeredAt: Date | null;
        };
    }>;
}

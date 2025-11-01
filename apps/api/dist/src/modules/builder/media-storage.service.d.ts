import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
interface UploadResult {
    imageUrl: string;
    s3Key?: string;
}
export declare class MediaStorageService {
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private s3;
    private bucket;
    private cdnBaseUrl;
    constructor(config: ConfigService, prisma: PrismaService);
    get enabled(): boolean;
    private buildPublicUrl;
    uploadFromUrl(sourceUrl: string, keyPrefix?: string): Promise<UploadResult>;
    recordGeneratedImage(params: {
        jobId?: string;
        elementJobId?: string;
        userAddress: string;
        prompt: string;
        imageUrl: string;
        s3Key?: string;
        metadata?: any;
    }): Promise<{
        createdAt: Date;
        id: string;
        userAddress: string;
        jobId: string | null;
        elementJobId: string | null;
        prompt: string;
        imageUrl: string;
        s3Key: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
export {};

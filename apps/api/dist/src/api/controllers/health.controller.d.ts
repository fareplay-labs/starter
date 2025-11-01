import { PrismaService } from '@/modules/prisma/prisma.service';
import { Queue } from 'bullmq';
export declare class HealthController {
    private readonly prisma;
    private readonly blockchainQueue;
    private readonly interpretationQueue;
    private readonly gameQueue;
    constructor(prisma: PrismaService, blockchainQueue: Queue, interpretationQueue: Queue, gameQueue: Queue);
    health(): Promise<{
        status: string;
        timestamp: string;
        database: string;
        redis: string;
        queues: {
            blockchainEvent: string;
            eventInterpretation: string;
            game: string;
        };
    }>;
    ready(): Promise<{
        status: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
    }>;
    live(): Promise<{
        status: string;
    }>;
}

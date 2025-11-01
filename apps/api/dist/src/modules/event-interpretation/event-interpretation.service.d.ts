import { Queue } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class EventInterpretationService {
    private readonly prisma;
    private readonly gameQueue;
    private readonly logger;
    constructor(prisma: PrismaService, gameQueue: Queue);
    interpretPoolRegistered(orderIndex: string): Promise<void>;
    interpretQkWithConfigRegistered(orderIndex: string): Promise<void>;
    interpretTrialRegistered(orderIndex: string): Promise<void>;
    interpretTrialResolved(orderIndex: string): Promise<void>;
    interpretFeeCharged(orderIndex: string): Promise<void>;
}

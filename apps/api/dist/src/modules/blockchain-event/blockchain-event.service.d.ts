import { Queue } from 'bullmq';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { TypedEvent } from '@/modules/solana/interfaces/events.interface';
export declare class BlockchainEventService {
    private readonly prisma;
    private readonly interpretationQueue;
    private readonly logger;
    constructor(prisma: PrismaService, interpretationQueue: Queue);
    storeEvents(events: TypedEvent[]): Promise<void>;
    private storeEvent;
    private storePoolRegistered;
    private storeQkWithConfigRegistered;
    private storeTrialRegistered;
    private storeTrialResolved;
    private storeFeeCharged;
}

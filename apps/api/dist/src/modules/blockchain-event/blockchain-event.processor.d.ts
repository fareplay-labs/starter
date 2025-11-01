import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BlockchainEventService } from './blockchain-event.service';
import { TypedEvent } from '@/modules/solana/interfaces/events.interface';
interface ProcessTransactionJob {
    signature: string;
    events: TypedEvent[];
}
export declare class BlockchainEventProcessor extends WorkerHost {
    private readonly blockchainEventService;
    private readonly logger;
    constructor(blockchainEventService: BlockchainEventService);
    process(job: Job<ProcessTransactionJob>): Promise<void>;
}
export {};

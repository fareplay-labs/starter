import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventInterpretationService } from './event-interpretation.service';
export declare class EventInterpretationProcessor extends WorkerHost {
    private readonly eventInterpretationService;
    private readonly logger;
    constructor(eventInterpretationService: EventInterpretationService);
    process(job: Job): Promise<void>;
}

import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { GameService } from './game.service';
export declare class GameProcessor extends WorkerHost {
    private readonly gameService;
    private readonly logger;
    constructor(gameService: GameService);
    process(job: Job): Promise<void>;
}

import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class GameService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createGameInstance(trialId: string): Promise<void>;
    resolveGameInstance(trialId: string, resultIndex: number): Promise<void>;
    private updateUserStats;
    private updateGlobalStats;
}

import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class StatsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getGlobalStats(): Promise<{
        totalWagered: string;
        totalPayout: string;
        totalPlays: number;
        totalPlayers: number;
        houseEdge: number;
    }>;
    getPoolStats(poolAddress: string): Promise<{
        poolAddress: string;
        managerAddress: string;
        totalTrials: number;
        resolvedTrials: number;
        pendingTrials: number;
        feePlayMultiplier: string;
        feeLossMultiplier: string;
        feeMintMultiplier: string;
        feeHostPercent: string;
        feePoolPercent: string;
    }>;
}

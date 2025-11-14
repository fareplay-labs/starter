import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class StatsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getGlobalStats(): Promise<{
        totalWagered: string;
        totalPayout: string;
        totalPlays: any;
        totalPlayers: any;
        houseEdge: number;
    }>;
    getPoolStats(poolAddress: string): Promise<{
        poolAddress: any;
        managerAddress: any;
        totalTrials: any;
        resolvedTrials: any;
        pendingTrials: number;
        feePlayMultiplier: any;
        feeLossMultiplier: any;
        feeMintMultiplier: any;
        feeHostPercent: any;
        feePoolPercent: any;
    }>;
}

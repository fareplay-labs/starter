import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class PlayerController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlayer(address: string): Promise<{
        address: string;
        username: string;
        avatarUrl: string;
        totalWagered: string;
        totalPayout: string;
        profitLoss: string;
        totalBets: number;
        totalWins: number;
        totalLosses: number;
        winRate: number;
        createdAt: Date;
        lastSeenAt: Date;
    }>;
    getPlayerTrials(address: string, limit?: string, offset?: string): Promise<{
        trials: {
            trialId: string;
            poolAddress: string;
            multiplier: string;
            qkWithConfigHash: string;
            extraDataHash: string;
            createdAt: Date;
            resolved: boolean;
            resolvedAt: Date;
            resultIndex: number;
            resultK: string;
            deltaAmount: string;
            gameResult: import("@prisma/client/runtime/library").JsonValue;
        }[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
}

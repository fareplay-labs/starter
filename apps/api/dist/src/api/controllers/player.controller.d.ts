import { PrismaService } from '@/modules/prisma/prisma.service';
export declare class PlayerController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPlayer(address: string): Promise<{
        address: any;
        username: any;
        avatarUrl: any;
        totalWagered: any;
        totalPayout: any;
        profitLoss: string;
        totalBets: any;
        totalWins: any;
        totalLosses: any;
        winRate: number;
        createdAt: any;
        lastSeenAt: any;
    }>;
    getPlayerTrials(address: string, limit?: string, offset?: string): Promise<{
        trials: any;
        pagination: {
            total: any;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
}

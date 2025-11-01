import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Public } from '@/modules/auth/jwt-auth.guard';

@Public() // Mark all player endpoints as public for now
@Controller('player')
export class PlayerController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get player information by wallet address
   * GET /api/player/:address
   */
  @Get(':address')
  async getPlayer(@Param('address') address: string) {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      throw new NotFoundException(`Player with address ${address} not found`);
    }

    const profitLoss =
      BigInt(user.totalPayout.toString()) - BigInt(user.totalWagered.toString());

    return {
      address: user.walletAddress,
      username: user.username,
      avatarUrl: user.avatarUrl,
      totalWagered: user.totalWagered.toString(),
      totalPayout: user.totalPayout.toString(),
      profitLoss: profitLoss.toString(),
      totalBets: user.totalBets,
      totalWins: user.totalWins,
      totalLosses: user.totalLosses,
      winRate: user.totalBets > 0 ? (user.totalWins / user.totalBets) * 100 : 0,
      createdAt: user.createdAt,
      lastSeenAt: user.lastSeenAt,
    };
  }

  /**
   * Get player trial history
   * GET /api/player/:address/trials?limit=50&offset=0
   */
  @Get(':address/trials')
  async getPlayerTrials(
    @Param('address') address: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    const [trials, totalCount] = await Promise.all([
      this.prisma.trial.findMany({
        where: { who: address },
        include: {
          trialRegistered: {
            include: {
              trialRegisteredEvent: true,
            },
          },
          trialResolved: {
            include: {
              trialResolvedEvent: true,
            },
          },
          gameConfig: true,
          gameInstance: true,
        },
        orderBy: {
          trialRegistered: {
            trialRegisteredEvent: {
              blockTime: 'desc',
            },
          },
        },
        take: limitNum,
        skip: offsetNum,
      }),
      this.prisma.trial.count({ where: { who: address } }),
    ]);

    const formattedTrials = trials.map((trial) => {
      const registeredEvent = trial.trialRegistered.trialRegisteredEvent;
      const resolvedEvent = trial.trialResolved?.trialResolvedEvent;

      return {
        trialId: trial.id,
        poolAddress: trial.poolAddress,
        multiplier: registeredEvent.multiplier.toString(),
        qkWithConfigHash: trial.qkWithConfigHash,
        extraDataHash: trial.extraDataHash,
        createdAt: registeredEvent.blockTime,
        resolved: !!trial.trialResolved,
        resolvedAt: resolvedEvent?.blockTime,
        resultIndex: resolvedEvent?.resultIndex,
        resultK: trial.resultK?.toString(),
        deltaAmount: trial.deltaAmount?.toString(),
        gameResult: trial.gameInstance?.result,
      };
    });

    return {
      trials: formattedTrials,
      pagination: {
        total: totalCount,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < totalCount,
      },
    };
  }
}

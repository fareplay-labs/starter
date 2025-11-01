import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Public } from '@/modules/auth/jwt-auth.guard';

@Public()
@Controller('stats')
export class StatsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get global casino stats
   * GET /api/stats
   */
  @Get()
  async getGlobalStats() {
    // Try to get the singleton global stats
    let globalStats = await this.prisma.globalStats.findUnique({
      where: { id: 'singleton' },
    });

    // If it doesn't exist, create it
    if (!globalStats) {
      globalStats = await this.prisma.globalStats.create({
        data: {
          id: 'singleton',
        },
      });
    }

    const totalWagered = BigInt(globalStats.totalWagered.toString());
    const totalPayout = BigInt(globalStats.totalPayout.toString());

    return {
      totalWagered: totalWagered.toString(),
      totalPayout: totalPayout.toString(),
      totalPlays: globalStats.totalPlays,
      totalPlayers: globalStats.totalPlayers,
      houseEdge:
        totalWagered > BigInt(0)
          ? Number(((totalWagered - totalPayout) * BigInt(10000)) / totalWagered) / 100
          : 0,
    };
  }

  /**
   * Get pool stats
   * GET /api/stats/pool/:poolAddress
   */
  @Get('pool/:poolAddress')
  async getPoolStats(@Param('poolAddress') poolAddress: string) {
    const pool = await this.prisma.pool.findUnique({
      where: { address: poolAddress },
      include: {
        poolRegistered: {
          include: {
            poolRegisteredEvent: true,
          },
        },
        trials: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!pool) {
      throw new NotFoundException(`Pool ${poolAddress} not found`);
    }

    // Count resolved trials
    const resolvedTrials = await this.prisma.trial.count({
      where: {
        poolAddress,
        trialResolved: {
          isNot: null,
        },
      },
    });

    const poolEvent = pool.poolRegistered.poolRegisteredEvent;

    return {
      poolAddress: pool.address,
      managerAddress: pool.poolRegistered.managerAddress,
      totalTrials: pool.trials.length,
      resolvedTrials,
      pendingTrials: pool.trials.length - resolvedTrials,
      feePlayMultiplier: poolEvent.feePlayMultiplier.toString(),
      feeLossMultiplier: poolEvent.feeLossMultiplier.toString(),
      feeMintMultiplier: poolEvent.feeMintMultiplier.toString(),
      feeHostPercent: poolEvent.feeHostPercent.toString(),
      feePoolPercent: poolEvent.feePoolPercent.toString(),
    };
  }
}

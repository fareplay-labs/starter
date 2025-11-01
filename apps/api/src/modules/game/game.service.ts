import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { toDecimalString, calculateDeltaAmount, decimalToBigInt } from '@/common/utils/decimal.utils';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a game instance for a trial
   */
  async createGameInstance(trialId: string): Promise<void> {
    const trial = await this.prisma.trial.findUnique({
      where: { id: trialId },
      include: {
        gameConfig: true,
      },
    });

    if (!trial) {
      throw new Error(`Trial ${trialId} not found`);
    }

    // Check if game instance already exists
    const existing = await this.prisma.gameInstance.findUnique({
      where: { id: trialId },
    });

    if (existing) {
      this.logger.debug(`GameInstance for trial ${trialId} already exists`);
      return;
    }

    // Create game instance
    await this.prisma.gameInstance.create({
      data: {
        id: trialId,
        gameConfigHash: trial.extraDataHash,
        result: null, // Will be filled when resolved
      },
    });

    this.logger.log(`Created GameInstance for trial ${trialId}`);
  }

  /**
   * Resolve a game instance with the result
   */
  async resolveGameInstance(trialId: string, resultIndex: number): Promise<void> {
    const trial = await this.prisma.trial.findUnique({
      where: { id: trialId },
      include: {
        qkWithConfigRegistered: {
          include: {
            qkWithConfigRegisteredEvent: true,
          },
        },
        trialRegistered: {
          include: {
            trialRegisteredEvent: true,
          },
        },
        gameConfig: true,
      },
    });

    if (!trial) {
      throw new Error(`Trial ${trialId} not found`);
    }

    if (!trial.qkWithConfigRegistered) {
      throw new Error(`QkWithConfigRegistered not found for trial ${trialId}`);
    }

    const qkEvent = trial.qkWithConfigRegistered.qkWithConfigRegisteredEvent;
    const trialEvent = trial.trialRegistered.trialRegisteredEvent;

    // Get K values
    const kValues = qkEvent.k;

    if (resultIndex >= kValues.length) {
      throw new Error(
        `Invalid result index ${resultIndex} for trial ${trialId} (K array length: ${kValues.length})`,
      );
    }

    // Get the result K value
    const resultK = kValues[resultIndex];
    const multiplier = trialEvent.multiplier;

    // Calculate delta amount: (resultK - 1e18) * multiplier / 1e18
    const deltaAmount = calculateDeltaAmount(resultK, multiplier);

    // Update trial with result
    await this.prisma.trial.update({
      where: { id: trialId },
      data: {
        resultK: toDecimalString(resultK),
        deltaAmount: toDecimalString(deltaAmount),
      },
    });

    // Update game instance with result
    const gameResult = {
      resultIndex,
      resultK: resultK.toString(),
      deltaAmount: deltaAmount.toString(),
      multiplier: multiplier.toString(),
    };

    await this.prisma.gameInstance.update({
      where: { id: trialId },
      data: {
        result: gameResult,
      },
    });

    this.logger.log(
      `Resolved GameInstance for trial ${trialId} - Result index: ${resultIndex}, Delta: ${deltaAmount}`,
    );

    // Update user stats
    if (trial.who) {
      await this.updateUserStats(trial.who, multiplier, deltaAmount);
    }

    // Update global stats
    await this.updateGlobalStats(multiplier, deltaAmount);
  }

  /**
   * Update user statistics after a game resolves
   */
  private async updateUserStats(
    walletAddress: string,
    multiplier: any,
    deltaAmount: bigint,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      // Create user if doesn't exist
      await this.prisma.user.create({
        data: {
          walletAddress,
          totalBets: 1,
          totalWins: deltaAmount > BigInt(0) ? 1 : 0,
          totalLosses: deltaAmount < BigInt(0) ? 1 : 0,
          totalWagered: toDecimalString(multiplier),
          totalPayout: toDecimalString(deltaAmount > BigInt(0) ? deltaAmount : BigInt(0)),
          lastSeenAt: new Date(),
        },
      });
    } else {
      // Update existing user
      await this.prisma.user.update({
        where: { walletAddress },
        data: {
          totalBets: { increment: 1 },
          totalWins: { increment: deltaAmount > BigInt(0) ? 1 : 0 },
          totalLosses: { increment: deltaAmount < BigInt(0) ? 1 : 0 },
          totalWagered: {
            set: toDecimalString(
              decimalToBigInt(user.totalWagered) + decimalToBigInt(multiplier),
            ),
          },
          totalPayout: {
            set: toDecimalString(
              decimalToBigInt(user.totalPayout) +
                (deltaAmount > BigInt(0) ? deltaAmount : BigInt(0)),
            ),
          },
          lastSeenAt: new Date(),
        },
      });
    }

    this.logger.debug(`Updated stats for user ${walletAddress}`);
  }

  /**
   * Update global statistics after a game resolves
   */
  private async updateGlobalStats(
    multiplier: any,
    deltaAmount: bigint,
  ): Promise<void> {
    // Ensure global stats exists (singleton)
    let stats = await this.prisma.globalStats.findUnique({
      where: { id: 'singleton' },
    });

    if (!stats) {
      stats = await this.prisma.globalStats.create({
        data: {
          id: 'singleton',
          totalPlays: 0,
          totalPlayers: 0,
        },
      });
    }

    // Update stats
    await this.prisma.globalStats.update({
      where: { id: 'singleton' },
      data: {
        totalPlays: { increment: 1 },
        totalWagered: {
          set: toDecimalString(
            decimalToBigInt(stats.totalWagered) + decimalToBigInt(multiplier),
          ),
        },
        totalPayout: {
          set: toDecimalString(
            decimalToBigInt(stats.totalPayout) +
              (deltaAmount > BigInt(0) ? deltaAmount : BigInt(0)),
          ),
        },
      },
    });

    this.logger.debug('Updated global stats');
  }
}


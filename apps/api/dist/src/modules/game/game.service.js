"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GameService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const decimal_utils_1 = require("../../common/utils/decimal.utils");
let GameService = GameService_1 = class GameService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GameService_1.name);
    }
    async createGameInstance(trialId) {
        const trial = await this.prisma.trial.findUnique({
            where: { id: trialId },
            include: {
                gameConfig: true,
            },
        });
        if (!trial) {
            throw new Error(`Trial ${trialId} not found`);
        }
        const existing = await this.prisma.gameInstance.findUnique({
            where: { id: trialId },
        });
        if (existing) {
            this.logger.debug(`GameInstance for trial ${trialId} already exists`);
            return;
        }
        await this.prisma.gameInstance.create({
            data: {
                id: trialId,
                gameConfigHash: trial.extraDataHash,
                result: null,
            },
        });
        this.logger.log(`Created GameInstance for trial ${trialId}`);
    }
    async resolveGameInstance(trialId, resultIndex) {
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
        const kValues = qkEvent.k;
        if (resultIndex >= kValues.length) {
            throw new Error(`Invalid result index ${resultIndex} for trial ${trialId} (K array length: ${kValues.length})`);
        }
        const resultK = kValues[resultIndex];
        const multiplier = trialEvent.multiplier;
        const deltaAmount = (0, decimal_utils_1.calculateDeltaAmount)(resultK, multiplier);
        await this.prisma.trial.update({
            where: { id: trialId },
            data: {
                resultK: (0, decimal_utils_1.toDecimalString)(resultK),
                deltaAmount: (0, decimal_utils_1.toDecimalString)(deltaAmount),
            },
        });
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
        this.logger.log(`Resolved GameInstance for trial ${trialId} - Result index: ${resultIndex}, Delta: ${deltaAmount}`);
        if (trial.who) {
            await this.updateUserStats(trial.who, multiplier, deltaAmount);
        }
        await this.updateGlobalStats(multiplier, deltaAmount);
    }
    async updateUserStats(walletAddress, multiplier, deltaAmount) {
        const user = await this.prisma.user.findUnique({
            where: { walletAddress },
        });
        if (!user) {
            await this.prisma.user.create({
                data: {
                    walletAddress,
                    totalBets: 1,
                    totalWins: deltaAmount > BigInt(0) ? 1 : 0,
                    totalLosses: deltaAmount < BigInt(0) ? 1 : 0,
                    totalWagered: (0, decimal_utils_1.toDecimalString)(multiplier),
                    totalPayout: (0, decimal_utils_1.toDecimalString)(deltaAmount > BigInt(0) ? deltaAmount : BigInt(0)),
                    lastSeenAt: new Date(),
                },
            });
        }
        else {
            await this.prisma.user.update({
                where: { walletAddress },
                data: {
                    totalBets: { increment: 1 },
                    totalWins: { increment: deltaAmount > BigInt(0) ? 1 : 0 },
                    totalLosses: { increment: deltaAmount < BigInt(0) ? 1 : 0 },
                    totalWagered: {
                        set: (0, decimal_utils_1.toDecimalString)((0, decimal_utils_1.decimalToBigInt)(user.totalWagered) + (0, decimal_utils_1.decimalToBigInt)(multiplier)),
                    },
                    totalPayout: {
                        set: (0, decimal_utils_1.toDecimalString)((0, decimal_utils_1.decimalToBigInt)(user.totalPayout) +
                            (deltaAmount > BigInt(0) ? deltaAmount : BigInt(0))),
                    },
                    lastSeenAt: new Date(),
                },
            });
        }
        this.logger.debug(`Updated stats for user ${walletAddress}`);
    }
    async updateGlobalStats(multiplier, deltaAmount) {
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
        await this.prisma.globalStats.update({
            where: { id: 'singleton' },
            data: {
                totalPlays: { increment: 1 },
                totalWagered: {
                    set: (0, decimal_utils_1.toDecimalString)((0, decimal_utils_1.decimalToBigInt)(stats.totalWagered) + (0, decimal_utils_1.decimalToBigInt)(multiplier)),
                },
                totalPayout: {
                    set: (0, decimal_utils_1.toDecimalString)((0, decimal_utils_1.decimalToBigInt)(stats.totalPayout) +
                        (deltaAmount > BigInt(0) ? deltaAmount : BigInt(0))),
                },
            },
        });
        this.logger.debug('Updated global stats');
    }
};
exports.GameService = GameService;
exports.GameService = GameService = GameService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameService);
//# sourceMappingURL=game.service.js.map
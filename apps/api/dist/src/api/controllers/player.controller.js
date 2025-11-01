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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
const jwt_auth_guard_1 = require("../../modules/auth/jwt-auth.guard");
let PlayerController = class PlayerController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlayer(address) {
        const user = await this.prisma.user.findUnique({
            where: { walletAddress: address },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Player with address ${address} not found`);
        }
        const profitLoss = BigInt(user.totalPayout.toString()) - BigInt(user.totalWagered.toString());
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
    async getPlayerTrials(address, limit, offset) {
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
};
exports.PlayerController = PlayerController;
__decorate([
    (0, common_1.Get)(':address'),
    __param(0, (0, common_1.Param)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayer", null);
__decorate([
    (0, common_1.Get)(':address/trials'),
    __param(0, (0, common_1.Param)('address')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PlayerController.prototype, "getPlayerTrials", null);
exports.PlayerController = PlayerController = __decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Controller)('player'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlayerController);
//# sourceMappingURL=player.controller.js.map
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
exports.StatsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
const jwt_auth_guard_1 = require("../../modules/auth/jwt-auth.guard");
let StatsController = class StatsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getGlobalStats() {
        let globalStats = await this.prisma.globalStats.findUnique({
            where: { id: 'singleton' },
        });
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
            houseEdge: totalWagered > BigInt(0)
                ? Number(((totalWagered - totalPayout) * BigInt(10000)) / totalWagered) / 100
                : 0,
        };
    }
    async getPoolStats(poolAddress) {
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
            throw new common_1.NotFoundException(`Pool ${poolAddress} not found`);
        }
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
};
exports.StatsController = StatsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getGlobalStats", null);
__decorate([
    (0, common_1.Get)('pool/:poolAddress'),
    __param(0, (0, common_1.Param)('poolAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StatsController.prototype, "getPoolStats", null);
exports.StatsController = StatsController = __decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Controller)('stats'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StatsController);
//# sourceMappingURL=stats.controller.js.map
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
var EventInterpretationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInterpretationService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const decimal_utils_1 = require("../../common/utils/decimal.utils");
const queue_module_1 = require("../queue/queue.module");
let EventInterpretationService = EventInterpretationService_1 = class EventInterpretationService {
    constructor(prisma, gameQueue) {
        this.prisma = prisma;
        this.gameQueue = gameQueue;
        this.logger = new common_1.Logger(EventInterpretationService_1.name);
    }
    async interpretPoolRegistered(orderIndex) {
        const event = await this.prisma.poolRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (!event) {
            throw new Error(`PoolRegisteredEvent not found: ${orderIndex}`);
        }
        const existing = await this.prisma.poolRegistered.findUnique({
            where: { id: orderIndex },
        });
        if (existing) {
            this.logger.debug(`PoolRegistered ${orderIndex} already interpreted`);
            return;
        }
        await this.prisma.poolRegistered.create({
            data: {
                id: orderIndex,
                poolAddress: event.poolAddress,
                managerAddress: event.managerAddress,
            },
        });
        const poolExists = await this.prisma.pool.findUnique({
            where: { address: event.poolAddress },
        });
        if (!poolExists) {
            await this.prisma.pool.create({
                data: {
                    address: event.poolAddress,
                },
            });
            this.logger.log(`Created Pool ${event.poolAddress}`);
        }
        this.logger.log(`Interpreted PoolRegistered ${orderIndex}`);
    }
    async interpretQkWithConfigRegistered(orderIndex) {
        const event = await this.prisma.qkWithConfigRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (!event) {
            throw new Error(`QkWithConfigRegisteredEvent not found: ${orderIndex}`);
        }
        const existing = await this.prisma.qkWithConfigRegistered.findUnique({
            where: { id: orderIndex },
        });
        if (existing) {
            this.logger.debug(`QkWithConfigRegistered ${orderIndex} already interpreted`);
            return;
        }
        await this.prisma.qkWithConfigRegistered.create({
            data: {
                id: orderIndex,
                qkWithConfigHash: event.qkWithConfigHash,
            },
        });
        this.logger.log(`Interpreted QkWithConfigRegistered ${orderIndex}`);
    }
    async interpretTrialRegistered(orderIndex) {
        const event = await this.prisma.trialRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (!event) {
            throw new Error(`TrialRegisteredEvent not found: ${orderIndex}`);
        }
        const existing = await this.prisma.trialRegistered.findUnique({
            where: { id: orderIndex },
        });
        if (existing) {
            this.logger.debug(`TrialRegistered ${orderIndex} already interpreted`);
            return;
        }
        const pool = await this.prisma.pool.findUnique({
            where: { address: event.poolAddress },
        });
        if (!pool) {
            throw new Error(`Pool ${event.poolAddress} not found - trying to process TrialRegistered before pool creation`);
        }
        const qkConfig = await this.prisma.qkWithConfigRegistered.findUnique({
            where: { qkWithConfigHash: event.qkWithConfigHash },
        });
        if (!qkConfig) {
            throw new Error(`QkWithConfigRegistered ${event.qkWithConfigHash} not found`);
        }
        await this.prisma.trialRegistered.create({
            data: {
                id: orderIndex,
                trialId: event.trialId,
            },
        });
        const trialExists = await this.prisma.trial.findUnique({
            where: { id: event.trialId },
        });
        if (!trialExists) {
            await this.prisma.trial.create({
                data: {
                    id: event.trialId,
                    poolAddress: event.poolAddress,
                    who: event.who,
                    qkWithConfigHash: event.qkWithConfigHash,
                    extraDataHash: event.extraDataHash,
                },
            });
            this.logger.log(`Created Trial ${event.trialId}`);
        }
        await this.gameQueue.add('createGameInstance', {
            trialId: event.trialId,
        });
        this.logger.log(`Interpreted TrialRegistered ${orderIndex}`);
    }
    async interpretTrialResolved(orderIndex) {
        const event = await this.prisma.trialResolvedEvent.findUnique({
            where: { orderIndex },
        });
        if (!event) {
            throw new Error(`TrialResolvedEvent not found: ${orderIndex}`);
        }
        const existing = await this.prisma.trialResolved.findUnique({
            where: { id: orderIndex },
        });
        if (existing) {
            this.logger.debug(`TrialResolved ${orderIndex} already interpreted`);
            return;
        }
        const trial = await this.prisma.trial.findUnique({
            where: { id: event.trialId },
        });
        if (!trial) {
            throw new Error(`Trial ${event.trialId} not found - trying to resolve non-existent trial`);
        }
        await this.prisma.trialResolved.create({
            data: {
                id: orderIndex,
                trialId: event.trialId,
            },
        });
        await this.gameQueue.add('resolveGameInstance', {
            trialId: event.trialId,
            resultIndex: event.resultIndex,
        });
        this.logger.log(`Interpreted TrialResolved ${orderIndex}`);
    }
    async interpretFeeCharged(orderIndex) {
        const event = await this.prisma.feeChargedEvent.findUnique({
            where: { orderIndex },
        });
        if (!event) {
            throw new Error(`FeeChargedEvent not found: ${orderIndex}`);
        }
        const existing = await this.prisma.feeCharged.findUnique({
            where: { id: orderIndex },
        });
        if (existing) {
            this.logger.debug(`FeeCharged ${orderIndex} already interpreted`);
            return;
        }
        const trial = await this.prisma.trial.findUnique({
            where: { id: event.trialId },
        });
        if (!trial) {
            throw new Error(`Trial ${event.trialId} not found for FeeCharged event`);
        }
        await this.prisma.feeCharged.create({
            data: {
                id: orderIndex,
            },
        });
        const feeExists = await this.prisma.fee.findUnique({
            where: { id: orderIndex },
        });
        if (!feeExists) {
            const feeAmount = BigInt(event.feeAmount.toString());
            const hostAmount = (feeAmount * BigInt(50)) / BigInt(100);
            const poolAmount = (feeAmount * BigInt(50)) / BigInt(100);
            await this.prisma.fee.create({
                data: {
                    id: orderIndex,
                    poolAddress: event.poolAddress,
                    trialId: event.trialId,
                    hostPercent: (0, decimal_utils_1.toDecimalString)(50),
                    poolPercent: (0, decimal_utils_1.toDecimalString)(50),
                    hostAmount: (0, decimal_utils_1.toDecimalString)(hostAmount),
                    poolAmount: (0, decimal_utils_1.toDecimalString)(poolAmount),
                },
            });
            this.logger.log(`Created Fee ${orderIndex}`);
        }
        this.logger.log(`Interpreted FeeCharged ${orderIndex}`);
    }
};
exports.EventInterpretationService = EventInterpretationService;
exports.EventInterpretationService = EventInterpretationService = EventInterpretationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.GAME)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], EventInterpretationService);
//# sourceMappingURL=event-interpretation.service.js.map
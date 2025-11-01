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
var BlockchainEventService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEventService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../prisma/prisma.service");
const decimal_utils_1 = require("../../common/utils/decimal.utils");
const queue_module_1 = require("../queue/queue.module");
let BlockchainEventService = BlockchainEventService_1 = class BlockchainEventService {
    constructor(prisma, interpretationQueue) {
        this.prisma = prisma;
        this.interpretationQueue = interpretationQueue;
        this.logger = new common_1.Logger(BlockchainEventService_1.name);
    }
    async storeEvents(events) {
        for (const typedEvent of events) {
            try {
                await this.storeEvent(typedEvent);
            }
            catch (error) {
                this.logger.error(`Failed to store ${typedEvent.eventType} event: ${error.message}`, error.stack);
                throw error;
            }
        }
    }
    async storeEvent(typedEvent) {
        const { eventType, event } = typedEvent;
        const orderIndex = (0, decimal_utils_1.calculateOrderIndex)(event.slot, event.instructionIndex, event.innerInstructionIndex);
        this.logger.debug(`Storing ${eventType} event - Order: ${orderIndex}, Sig: ${event.signature}`);
        switch (eventType) {
            case 'PoolRegistered':
                await this.storePoolRegistered(event, orderIndex);
                break;
            case 'QkWithConfigRegistered':
                await this.storeQkWithConfigRegistered(event, orderIndex);
                break;
            case 'TrialRegistered':
                await this.storeTrialRegistered(event, orderIndex);
                break;
            case 'TrialResolved':
                await this.storeTrialResolved(event, orderIndex);
                break;
            case 'FeeCharged':
                await this.storeFeeCharged(event, orderIndex);
                break;
            default:
                this.logger.warn(`Unknown event type: ${eventType}`);
        }
    }
    async storePoolRegistered(event, orderIndex) {
        const existing = await this.prisma.poolRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (existing) {
            this.logger.debug(`PoolRegistered event ${orderIndex} already exists, skipping`);
            return;
        }
        await this.prisma.poolRegisteredEvent.create({
            data: {
                orderIndex,
                slot: (0, decimal_utils_1.toDecimalString)(event.slot),
                instructionIndex: event.instructionIndex,
                innerInstructionIndex: event.innerInstructionIndex,
                signature: event.signature,
                blockTime: event.blockTime,
                poolAddress: event.poolAddress,
                managerAddress: event.managerAddress,
                feePlayMultiplier: (0, decimal_utils_1.toDecimalString)(event.feePlayMultiplier),
                feeLossMultiplier: (0, decimal_utils_1.toDecimalString)(event.feeLossMultiplier),
                feeMintMultiplier: (0, decimal_utils_1.toDecimalString)(event.feeMintMultiplier),
                feeHostPercent: (0, decimal_utils_1.toDecimalString)(event.feeHostPercent),
                feePoolPercent: (0, decimal_utils_1.toDecimalString)(event.feePoolPercent),
                minLimitForTicket: (0, decimal_utils_1.toDecimalString)(event.minLimitForTicket),
                probability: (0, decimal_utils_1.toDecimalString)(event.probability),
            },
        });
        await this.interpretationQueue.add('interpretPoolRegistered', {
            orderIndex,
        });
        this.logger.log(`Stored PoolRegistered event ${orderIndex}`);
    }
    async storeQkWithConfigRegistered(event, orderIndex) {
        const existing = await this.prisma.qkWithConfigRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (existing) {
            this.logger.debug(`QkWithConfigRegistered event ${orderIndex} already exists, skipping`);
            return;
        }
        await this.prisma.qkWithConfigRegisteredEvent.create({
            data: {
                orderIndex,
                slot: (0, decimal_utils_1.toDecimalString)(event.slot),
                instructionIndex: event.instructionIndex,
                innerInstructionIndex: event.innerInstructionIndex,
                signature: event.signature,
                blockTime: event.blockTime,
                qkWithConfigHash: event.qkWithConfigHash,
                q: event.q.map(decimal_utils_1.toDecimalString),
                k: event.k.map(decimal_utils_1.toDecimalString),
                feeLossMultiplier: (0, decimal_utils_1.toDecimalString)(event.feeLossMultiplier),
                feeMintMultiplier: (0, decimal_utils_1.toDecimalString)(event.feeMintMultiplier),
                effectiveEv: (0, decimal_utils_1.toDecimalString)(event.effectiveEv),
            },
        });
        await this.interpretationQueue.add('interpretQkWithConfigRegistered', {
            orderIndex,
        });
        this.logger.log(`Stored QkWithConfigRegistered event ${orderIndex}`);
    }
    async storeTrialRegistered(event, orderIndex) {
        const existing = await this.prisma.trialRegisteredEvent.findUnique({
            where: { orderIndex },
        });
        if (existing) {
            this.logger.debug(`TrialRegistered event ${orderIndex} already exists, skipping`);
            return;
        }
        await this.prisma.trialRegisteredEvent.create({
            data: {
                orderIndex,
                slot: (0, decimal_utils_1.toDecimalString)(event.slot),
                instructionIndex: event.instructionIndex,
                innerInstructionIndex: event.innerInstructionIndex,
                signature: event.signature,
                blockTime: event.blockTime,
                trialId: event.trialId,
                who: event.who,
                poolAddress: event.poolAddress,
                multiplier: (0, decimal_utils_1.toDecimalString)(event.multiplier),
                qkWithConfigHash: event.qkWithConfigHash,
                vrfCostInFare: (0, decimal_utils_1.toDecimalString)(event.vrfCostInFare),
                extraDataHash: event.extraDataHash,
            },
        });
        await this.interpretationQueue.add('interpretTrialRegistered', {
            orderIndex,
        });
        this.logger.log(`Stored TrialRegistered event ${orderIndex}`);
    }
    async storeTrialResolved(event, orderIndex) {
        const existing = await this.prisma.trialResolvedEvent.findUnique({
            where: { orderIndex },
        });
        if (existing) {
            this.logger.debug(`TrialResolved event ${orderIndex} already exists, skipping`);
            return;
        }
        await this.prisma.trialResolvedEvent.create({
            data: {
                orderIndex,
                slot: (0, decimal_utils_1.toDecimalString)(event.slot),
                instructionIndex: event.instructionIndex,
                innerInstructionIndex: event.innerInstructionIndex,
                signature: event.signature,
                blockTime: event.blockTime,
                trialId: event.trialId,
                resultIndex: event.resultIndex,
                randomness: (0, decimal_utils_1.toDecimalString)(event.randomness),
            },
        });
        await this.interpretationQueue.add('interpretTrialResolved', {
            orderIndex,
        });
        this.logger.log(`Stored TrialResolved event ${orderIndex}`);
    }
    async storeFeeCharged(event, orderIndex) {
        const existing = await this.prisma.feeChargedEvent.findUnique({
            where: { orderIndex },
        });
        if (existing) {
            this.logger.debug(`FeeCharged event ${orderIndex} already exists, skipping`);
            return;
        }
        await this.prisma.feeChargedEvent.create({
            data: {
                orderIndex,
                slot: (0, decimal_utils_1.toDecimalString)(event.slot),
                instructionIndex: event.instructionIndex,
                innerInstructionIndex: event.innerInstructionIndex,
                signature: event.signature,
                blockTime: event.blockTime,
                feeType: event.feeType,
                poolAddress: event.poolAddress,
                trialId: event.trialId,
                feeAmount: (0, decimal_utils_1.toDecimalString)(event.feeAmount),
            },
        });
        await this.interpretationQueue.add('interpretFeeCharged', {
            orderIndex,
        });
        this.logger.log(`Stored FeeCharged event ${orderIndex}`);
    }
};
exports.BlockchainEventService = BlockchainEventService;
exports.BlockchainEventService = BlockchainEventService = BlockchainEventService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.EVENT_INTERPRETATION)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue])
], BlockchainEventService);
//# sourceMappingURL=blockchain-event.service.js.map
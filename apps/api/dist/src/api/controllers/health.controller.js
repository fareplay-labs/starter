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
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../modules/prisma/prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const queue_module_1 = require("../../modules/queue/queue.module");
const jwt_auth_guard_1 = require("../../modules/auth/jwt-auth.guard");
let HealthController = class HealthController {
    constructor(prisma, blockchainQueue, interpretationQueue, gameQueue) {
        this.prisma = prisma;
        this.blockchainQueue = blockchainQueue;
        this.interpretationQueue = interpretationQueue;
        this.gameQueue = gameQueue;
    }
    async health() {
        const checks = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'unknown',
            redis: 'unknown',
            queues: {
                blockchainEvent: 'unknown',
                eventInterpretation: 'unknown',
                game: 'unknown',
            },
        };
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks.database = 'connected';
        }
        catch (error) {
            checks.database = 'disconnected';
            checks.status = 'error';
        }
        try {
            const blockchainQueueClient = await this.blockchainQueue.client;
            await blockchainQueueClient.ping();
            checks.redis = 'connected';
            const [blockchainWaiting, blockchainActive, interpretationWaiting, interpretationActive, gameWaiting, gameActive,] = await Promise.all([
                this.blockchainQueue.getWaitingCount(),
                this.blockchainQueue.getActiveCount(),
                this.interpretationQueue.getWaitingCount(),
                this.interpretationQueue.getActiveCount(),
                this.gameQueue.getWaitingCount(),
                this.gameQueue.getActiveCount(),
            ]);
            checks.queues = {
                blockchainEvent: `waiting: ${blockchainWaiting}, active: ${blockchainActive}`,
                eventInterpretation: `waiting: ${interpretationWaiting}, active: ${interpretationActive}`,
                game: `waiting: ${gameWaiting}, active: ${gameActive}`,
            };
        }
        catch (error) {
            checks.redis = 'disconnected';
            checks.status = 'error';
        }
        return checks;
    }
    async ready() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            const blockchainQueueClient = await this.blockchainQueue.client;
            await blockchainQueueClient.ping();
            return { status: 'ready' };
        }
        catch (error) {
            return { status: 'not ready', error: error.message };
        }
    }
    async live() {
        return { status: 'alive' };
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('ready'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "live", null);
exports.HealthController = HealthController = __decorate([
    (0, jwt_auth_guard_1.Public)(),
    (0, common_1.Controller)('health'),
    __param(1, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.BLOCKCHAIN_EVENT)),
    __param(2, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.EVENT_INTERPRETATION)),
    __param(3, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.GAME)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        bullmq_2.Queue,
        bullmq_2.Queue,
        bullmq_2.Queue])
], HealthController);
//# sourceMappingURL=health.controller.js.map
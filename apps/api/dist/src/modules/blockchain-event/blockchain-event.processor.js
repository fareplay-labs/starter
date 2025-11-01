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
var BlockchainEventProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEventProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const blockchain_event_service_1 = require("./blockchain-event.service");
const queue_module_1 = require("../queue/queue.module");
let BlockchainEventProcessor = BlockchainEventProcessor_1 = class BlockchainEventProcessor extends bullmq_1.WorkerHost {
    constructor(blockchainEventService) {
        super();
        this.blockchainEventService = blockchainEventService;
        this.logger = new common_1.Logger(BlockchainEventProcessor_1.name);
    }
    async process(job) {
        const { signature, events } = job.data;
        this.logger.log(`Processing transaction ${signature} with ${events.length} events`);
        try {
            await this.blockchainEventService.storeEvents(events);
            this.logger.log(`Successfully processed transaction ${signature}`);
        }
        catch (error) {
            this.logger.error(`Failed to process transaction ${signature}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BlockchainEventProcessor = BlockchainEventProcessor;
exports.BlockchainEventProcessor = BlockchainEventProcessor = BlockchainEventProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_module_1.QUEUE_NAMES.BLOCKCHAIN_EVENT),
    __metadata("design:paramtypes", [blockchain_event_service_1.BlockchainEventService])
], BlockchainEventProcessor);
//# sourceMappingURL=blockchain-event.processor.js.map
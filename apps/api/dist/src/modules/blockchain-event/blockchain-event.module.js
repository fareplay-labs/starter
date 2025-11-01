"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockchainEventModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const blockchain_event_service_1 = require("./blockchain-event.service");
const blockchain_event_processor_1 = require("./blockchain-event.processor");
const queue_module_1 = require("../queue/queue.module");
let BlockchainEventModule = class BlockchainEventModule {
};
exports.BlockchainEventModule = BlockchainEventModule;
exports.BlockchainEventModule = BlockchainEventModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: queue_module_1.QUEUE_NAMES.BLOCKCHAIN_EVENT }),
            bullmq_1.BullModule.registerQueue({ name: queue_module_1.QUEUE_NAMES.EVENT_INTERPRETATION }),
        ],
        providers: [blockchain_event_service_1.BlockchainEventService, blockchain_event_processor_1.BlockchainEventProcessor],
        exports: [blockchain_event_service_1.BlockchainEventService],
    })
], BlockchainEventModule);
//# sourceMappingURL=blockchain-event.module.js.map
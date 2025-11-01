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
var EventInterpretationProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInterpretationProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const event_interpretation_service_1 = require("./event-interpretation.service");
const queue_module_1 = require("../queue/queue.module");
let EventInterpretationProcessor = EventInterpretationProcessor_1 = class EventInterpretationProcessor extends bullmq_1.WorkerHost {
    constructor(eventInterpretationService) {
        super();
        this.eventInterpretationService = eventInterpretationService;
        this.logger = new common_1.Logger(EventInterpretationProcessor_1.name);
    }
    async process(job) {
        const { orderIndex } = job.data;
        this.logger.debug(`Processing ${job.name} - Order: ${orderIndex}`);
        try {
            switch (job.name) {
                case 'interpretPoolRegistered':
                    await this.eventInterpretationService.interpretPoolRegistered(orderIndex);
                    break;
                case 'interpretQkWithConfigRegistered':
                    await this.eventInterpretationService.interpretQkWithConfigRegistered(orderIndex);
                    break;
                case 'interpretTrialRegistered':
                    await this.eventInterpretationService.interpretTrialRegistered(orderIndex);
                    break;
                case 'interpretTrialResolved':
                    await this.eventInterpretationService.interpretTrialResolved(orderIndex);
                    break;
                case 'interpretFeeCharged':
                    await this.eventInterpretationService.interpretFeeCharged(orderIndex);
                    break;
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
            }
            this.logger.log(`Successfully processed ${job.name} - Order: ${orderIndex}`);
        }
        catch (error) {
            this.logger.error(`Failed to process ${job.name} - Order: ${orderIndex}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.EventInterpretationProcessor = EventInterpretationProcessor;
exports.EventInterpretationProcessor = EventInterpretationProcessor = EventInterpretationProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_module_1.QUEUE_NAMES.EVENT_INTERPRETATION),
    __metadata("design:paramtypes", [event_interpretation_service_1.EventInterpretationService])
], EventInterpretationProcessor);
//# sourceMappingURL=event-interpretation.processor.js.map
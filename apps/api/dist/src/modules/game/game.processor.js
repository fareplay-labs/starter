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
var GameProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const queue_module_1 = require("../queue/queue.module");
let GameProcessor = GameProcessor_1 = class GameProcessor extends bullmq_1.WorkerHost {
    constructor(gameService) {
        super();
        this.gameService = gameService;
        this.logger = new common_1.Logger(GameProcessor_1.name);
    }
    async process(job) {
        this.logger.debug(`Processing ${job.name} - Job ID: ${job.id}`);
        try {
            switch (job.name) {
                case 'createGameInstance':
                    await this.gameService.createGameInstance(job.data.trialId);
                    break;
                case 'resolveGameInstance':
                    await this.gameService.resolveGameInstance(job.data.trialId, job.data.resultIndex);
                    break;
                default:
                    this.logger.warn(`Unknown job name: ${job.name}`);
            }
            this.logger.log(`Successfully processed ${job.name} - Job ID: ${job.id}`);
        }
        catch (error) {
            this.logger.error(`Failed to process ${job.name} - Job ID: ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GameProcessor = GameProcessor;
exports.GameProcessor = GameProcessor = GameProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_module_1.QUEUE_NAMES.GAME),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameProcessor);
//# sourceMappingURL=game.processor.js.map
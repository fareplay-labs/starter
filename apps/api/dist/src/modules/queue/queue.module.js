"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = exports.QUEUE_NAMES = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
exports.QUEUE_NAMES = {
    BLOCKCHAIN_EVENT: 'blockchain-event',
    EVENT_INTERPRETATION: 'event-interpretation',
    GAME: 'game',
    BUILDER_DESIGN: 'builder-design',
    BUILDER_ELEMENT: 'builder-element',
};
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    connection: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6379),
                        password: configService.get('REDIS_PASSWORD'),
                        ...(configService.get('REDIS_URL') && parseRedisUrl(configService.get('REDIS_URL'))),
                    },
                    defaultJobOptions: {
                        attempts: 3,
                        backoff: {
                            type: 'exponential',
                            delay: 1000,
                        },
                        removeOnComplete: 1000,
                        removeOnFail: 5000,
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            bullmq_1.BullModule.registerQueue({ name: exports.QUEUE_NAMES.BLOCKCHAIN_EVENT }, { name: exports.QUEUE_NAMES.EVENT_INTERPRETATION }, { name: exports.QUEUE_NAMES.GAME }, { name: exports.QUEUE_NAMES.BUILDER_DESIGN }, { name: exports.QUEUE_NAMES.BUILDER_ELEMENT }),
        ],
        exports: [bullmq_1.BullModule],
    })
], QueueModule);
function parseRedisUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return {
            host: parsedUrl.hostname,
            port: parseInt(parsedUrl.port || '6379', 10),
            password: parsedUrl.password || undefined,
        };
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=queue.module.js.map
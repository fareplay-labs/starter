"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./modules/prisma/prisma.module");
const queue_module_1 = require("./modules/queue/queue.module");
const solana_module_1 = require("./modules/solana/solana.module");
const blockchain_event_module_1 = require("./modules/blockchain-event/blockchain-event.module");
const event_interpretation_module_1 = require("./modules/event-interpretation/event-interpretation.module");
const game_module_1 = require("./modules/game/game.module");
const auth_module_1 = require("./modules/auth/auth.module");
const chat_module_1 = require("./modules/chat/chat.module");
const heartbeat_module_1 = require("./modules/heartbeat/heartbeat.module");
const jwt_auth_guard_1 = require("./modules/auth/jwt-auth.guard");
const player_controller_1 = require("./api/controllers/player.controller");
const stats_controller_1 = require("./api/controllers/stats.controller");
const health_controller_1 = require("./api/controllers/health.controller");
const casino_settings_controller_1 = require("./api/controllers/casino-settings.controller");
const game_gateway_1 = require("./api/gateways/game.gateway");
const builder_module_1 = require("./modules/builder/builder.module");
const builder_gateway_1 = require("./api/gateways/builder.gateway");
const content_controller_1 = require("./api/controllers/content.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            solana_module_1.SolanaModule,
            auth_module_1.AuthModule,
            chat_module_1.ChatModule,
            heartbeat_module_1.HeartbeatModule,
            blockchain_event_module_1.BlockchainEventModule,
            event_interpretation_module_1.EventInterpretationModule,
            game_module_1.GameModule,
            builder_module_1.BuilderModule,
        ],
        controllers: [
            player_controller_1.PlayerController,
            stats_controller_1.StatsController,
            health_controller_1.HealthController,
            casino_settings_controller_1.CasinoSettingsController,
            content_controller_1.ContentController,
        ],
        providers: [
            game_gateway_1.GameGateway,
            builder_gateway_1.BuilderGateway,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
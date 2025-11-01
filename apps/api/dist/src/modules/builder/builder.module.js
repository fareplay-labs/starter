"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("../prisma/prisma.module");
const queue_module_1 = require("../queue/queue.module");
const builder_controller_1 = require("./builder.controller");
const builder_service_1 = require("./builder.service");
const openai_provider_1 = require("./openai.provider");
const schema_registry_service_1 = require("./schema-registry.service");
const orchestrator_service_1 = require("./orchestrator.service");
const media_storage_service_1 = require("./media-storage.service");
const builder_design_processor_1 = require("./builder.design.processor");
const builder_element_processor_1 = require("./builder.element.processor");
const builder_gateway_1 = require("../../api/gateways/builder.gateway");
const ai_generation_service_1 = require("./ai-generation.service");
const ai_image_service_1 = require("./ai-image.service");
const ai_game_design_service_1 = require("./ai-game-design.service");
let BuilderModule = class BuilderModule {
};
exports.BuilderModule = BuilderModule;
exports.BuilderModule = BuilderModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            bullmq_1.BullModule.registerQueue({ name: queue_module_1.QUEUE_NAMES.BUILDER_DESIGN }, { name: queue_module_1.QUEUE_NAMES.BUILDER_ELEMENT }),
        ],
        controllers: [builder_controller_1.BuilderController],
        providers: [
            builder_service_1.BuilderService,
            openai_provider_1.OpenAiProvider,
            ai_generation_service_1.AIGenerationService,
            ai_image_service_1.AIImageGenerationService,
            ai_game_design_service_1.AIGameDesignService,
            schema_registry_service_1.SchemaRegistryService,
            orchestrator_service_1.OrchestratorService,
            media_storage_service_1.MediaStorageService,
            builder_design_processor_1.BuilderDesignProcessor,
            builder_element_processor_1.BuilderElementProcessor,
            builder_gateway_1.BuilderGateway,
        ],
        exports: [builder_service_1.BuilderService],
    })
], BuilderModule);
//# sourceMappingURL=builder.module.js.map
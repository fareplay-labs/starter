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
var BuilderElementProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderElementProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queue_module_1 = require("../queue/queue.module");
const prisma_service_1 = require("../prisma/prisma.service");
const builder_gateway_1 = require("../../api/gateways/builder.gateway");
const ai_generation_service_1 = require("./ai-generation.service");
const ai_image_service_1 = require("./ai-image.service");
let BuilderElementProcessor = BuilderElementProcessor_1 = class BuilderElementProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, gateway, gen, imageGen) {
        super();
        this.prisma = prisma;
        this.gateway = gateway;
        this.gen = gen;
        this.imageGen = imageGen;
        this.logger = new common_1.Logger(BuilderElementProcessor_1.name);
    }
    async process(job) {
        const jobId = job.data.jobId;
        this.logger.debug(`Processing element job ${jobId}`);
        try {
            await this.prisma.elementGenerationJob.update({
                where: { id: jobId },
                data: { status: 'PROCESSING', progress: 10 },
            });
            this.gateway.emitToJob(jobId, 'builder:jobStarted', { jobId });
            const ej = await this.prisma.elementGenerationJob.findUnique({ where: { id: jobId } });
            const userAddress = ej?.userAddress;
            const gameType = ej?.gameType || 'generic';
            const prompt = ej?.finalPrompt || ej?.userPrompt || 'Generate a themed asset';
            const imageUrl = await this.imageGen.generateAsset(jobId, userAddress, prompt, `builder/elements/${gameType}`);
            await this.prisma.elementGenerationJob.update({
                where: { id: jobId },
                data: { status: 'COMPLETE', progress: 100, result: { images: [imageUrl] }, completedAt: new Date() },
            });
            this.gateway.emitToJob(jobId, 'builder:preview', { jobId, element: { gameType, imageUrl } });
            this.gateway.emitToJob(jobId, 'builder:jobSucceeded', { jobId, result: { images: [imageUrl] } });
        }
        catch (err) {
            this.logger.error(`Element job failed ${jobId}: ${err.message}`);
            await this.prisma.elementGenerationJob.update({
                where: { id: jobId },
                data: { status: 'ERROR', error: String(err?.message || err) },
            });
            this.gateway.emitToJob(jobId, 'builder:jobFailed', { jobId, error: String(err?.message || err) });
            throw err;
        }
    }
};
exports.BuilderElementProcessor = BuilderElementProcessor;
exports.BuilderElementProcessor = BuilderElementProcessor = BuilderElementProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_module_1.QUEUE_NAMES.BUILDER_ELEMENT),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        builder_gateway_1.BuilderGateway,
        ai_generation_service_1.AIGenerationService,
        ai_image_service_1.AIImageGenerationService])
], BuilderElementProcessor);
//# sourceMappingURL=builder.element.processor.js.map
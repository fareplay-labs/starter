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
var BuilderDesignProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderDesignProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queue_module_1 = require("../queue/queue.module");
const prisma_service_1 = require("../prisma/prisma.service");
const builder_gateway_1 = require("../../api/gateways/builder.gateway");
const orchestrator_service_1 = require("./orchestrator.service");
let BuilderDesignProcessor = BuilderDesignProcessor_1 = class BuilderDesignProcessor extends bullmq_1.WorkerHost {
    constructor(prisma, gateway, orchestrator) {
        super();
        this.prisma = prisma;
        this.gateway = gateway;
        this.orchestrator = orchestrator;
        this.logger = new common_1.Logger(BuilderDesignProcessor_1.name);
    }
    async process(job) {
        const jobId = job.data.jobId;
        this.logger.debug(`Processing design job ${jobId}`);
        try {
            await this.orchestrator.executeDesign(jobId);
        }
        catch (err) {
            this.logger.error(`Design job failed ${jobId}: ${err.message}`);
            await this.prisma.casinoDesignJob.update({
                where: { id: jobId },
                data: { status: 'ERROR', error: String(err?.message || err) },
            });
            this.gateway.emitToJob(jobId, 'builder:jobFailed', { jobId, error: String(err?.message || err) });
            throw err;
        }
    }
};
exports.BuilderDesignProcessor = BuilderDesignProcessor;
exports.BuilderDesignProcessor = BuilderDesignProcessor = BuilderDesignProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_module_1.QUEUE_NAMES.BUILDER_DESIGN),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        builder_gateway_1.BuilderGateway,
        orchestrator_service_1.OrchestratorService])
], BuilderDesignProcessor);
//# sourceMappingURL=builder.design.processor.js.map
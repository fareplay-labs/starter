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
var BuilderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const queue_module_1 = require("../queue/queue.module");
let BuilderService = BuilderService_1 = class BuilderService {
    constructor(prisma, config, designQueue, elementQueue) {
        this.prisma = prisma;
        this.config = config;
        this.designQueue = designQueue;
        this.elementQueue = elementQueue;
        this.logger = new common_1.Logger(BuilderService_1.name);
    }
    async createDesignJob(casinoName, prompt, options) {
        const userAddress = options?.userAddress || this.config.get('SOLANA_OWNER_ADDRESS') || undefined;
        const data = {
            casinoName,
            userPrompt: prompt,
            config: options || {},
            stepResults: {},
        };
        if (userAddress)
            data.user = { connect: { walletAddress: userAddress } };
        const job = await this.prisma.casinoDesignJob.create({ data });
        await this.designQueue.add('design', { jobId: job.id }, { removeOnComplete: 1000, removeOnFail: 1000 });
        return job;
    }
    async createElementJob(gameType, prompt, parameterId, options) {
        const userAddress = options?.userAddress || this.config.get('SOLANA_OWNER_ADDRESS') || undefined;
        const data2 = {
            gameType,
            userPrompt: prompt,
            finalPrompt: prompt,
            parameterId,
            config: options || {},
        };
        if (userAddress)
            data2.user = { connect: { walletAddress: userAddress } };
        const job = await this.prisma.elementGenerationJob.create({ data: data2 });
        await this.elementQueue.add('element', { jobId: job.id }, { removeOnComplete: 1000, removeOnFail: 1000 });
        return job;
    }
    async listJobs(type, limit = 20, offset = 0) {
        if (type === 'element') {
            const [rows, total] = await Promise.all([
                this.prisma.elementGenerationJob.findMany({ orderBy: { startedAt: 'desc' }, skip: offset, take: limit }),
                this.prisma.elementGenerationJob.count(),
            ]);
            return { rows, total, limit, offset };
        }
        const [rows, total] = await Promise.all([
            this.prisma.casinoDesignJob.findMany({ orderBy: { startedAt: 'desc' }, skip: offset, take: limit }),
            this.prisma.casinoDesignJob.count(),
        ]);
        return { rows, total, limit, offset };
    }
    async getJob(id) {
        const job = await this.prisma.casinoDesignJob.findUnique({ where: { id }, include: { generatedImages: true } });
        if (job)
            return job;
        return this.prisma.elementGenerationJob.findUnique({ where: { id }, include: { generatedImages: true } });
    }
    async applyDesign(jobId) {
        const job = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
        if (!job || !job.result) {
            throw new Error('Design job not complete');
        }
        const rawResult = job.result;
        const isFinalDesignResult = (v) => {
            if (!v || typeof v !== 'object')
                return false;
            const o = v;
            return (typeof o.id === 'string' &&
                typeof o.title === 'string' &&
                typeof o.themeParagraph === 'string' &&
                Array.isArray(o.colors) && o.colors.every((c) => typeof c === 'string') &&
                typeof o.font === 'string');
        };
        const stepResults = (job.stepResults || {});
        const colorsStep = stepResults?.colors;
        let theme;
        if (isFinalDesignResult(rawResult)) {
            theme = {
                colors: rawResult.colors || colorsStep?.selectedColors || [],
                font: rawResult.font || colorsStep?.selectedFont || '',
                paragraph: rawResult.themeParagraph || '',
                assets: {
                    logoUrl: rawResult.profileImage || null,
                    bannerUrl: rawResult.bannerImage || null,
                },
            };
        }
        else {
            theme = {
                colors: colorsStep?.selectedColors || [],
                font: colorsStep?.selectedFont || '',
                paragraph: '',
                assets: {},
            };
        }
        const themeJson = {
            colors: Array.isArray(theme.colors) ? [...theme.colors] : [],
            font: theme.font,
            paragraph: theme.paragraph,
            assets: {
                logoUrl: theme.assets?.logoUrl ?? null,
                bannerUrl: theme.assets?.bannerUrl ?? null,
            },
        };
        const baseUpdate = {
            name: job.casinoName,
            primaryColor: theme.colors?.[0] || undefined,
            logoUrl: theme.assets?.logoUrl || undefined,
            bannerUrl: theme.assets?.bannerUrl || undefined,
        };
        const updateData = {
            ...baseUpdate,
            theme: themeJson,
        };
        const updated = await this.prisma.casinoSettings.update({
            where: { id: 'singleton' },
            data: updateData,
        });
        return { applied: true, settings: updated };
    }
};
exports.BuilderService = BuilderService;
exports.BuilderService = BuilderService = BuilderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.BUILDER_DESIGN)),
    __param(3, (0, bullmq_1.InjectQueue)(queue_module_1.QUEUE_NAMES.BUILDER_ELEMENT)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        bullmq_2.Queue,
        bullmq_2.Queue])
], BuilderService);
//# sourceMappingURL=builder.service.js.map
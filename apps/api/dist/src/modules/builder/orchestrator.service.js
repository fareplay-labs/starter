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
var OrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const builder_gateway_1 = require("../../api/gateways/builder.gateway");
const schema_registry_service_1 = require("./schema-registry.service");
const ai_generation_service_1 = require("./ai-generation.service");
const ai_image_service_1 = require("./ai-image.service");
const ai_game_design_service_1 = require("./ai-game-design.service");
let OrchestratorService = OrchestratorService_1 = class OrchestratorService {
    constructor(prisma, config, gateway, registry, gen, imageGen, gameDesign) {
        this.prisma = prisma;
        this.config = config;
        this.gateway = gateway;
        this.registry = registry;
        this.gen = gen;
        this.imageGen = imageGen;
        this.gameDesign = gameDesign;
        this.logger = new common_1.Logger(OrchestratorService_1.name);
    }
    async executeDesign(jobId) {
        const startedAtMs = Date.now();
        let lastStepStart = startedAtMs;
        let lastStepName = 'init';
        this.logger.log(`[${jobId}] Orchestrator start`);
        const job = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
        if (!job)
            throw new Error(`Job not found: ${jobId}`);
        const casinoName = job.casinoName || 'My Casino';
        const userPrompt = job.userPrompt || '';
        this.logger.debug(`[${jobId}] Input: casinoName="${casinoName}", promptLen=${userPrompt.length}`);
        const updateProgress = async (progress, step) => {
            const now = Date.now();
            const duration = now - lastStepStart;
            try {
                this.gateway.emitToJob(jobId, 'builder:metrics', { jobId, step: lastStepName, ms: duration });
            }
            catch { }
            lastStepStart = now;
            lastStepName = step;
            await this.prisma.casinoDesignJob.update({ where: { id: jobId }, data: { progress, currentStep: step, status: 'PROCESSING' } });
            this.gateway.emitToJob(jobId, 'builder:jobProgress', { jobId, progress, step });
        };
        const setStepResults = async (data) => {
            const current = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
            const prev = current?.stepResults || {};
            await this.prisma.casinoDesignJob.update({ where: { id: jobId }, data: { stepResults: { ...prev, ...data } } });
        };
        const toTitle = (s) => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        await updateProgress(10, OrchestratorService_1.Step.Theme);
        const themeSchema = {
            type: 'object',
            properties: {
                themeParagraph: { type: 'string' },
                shortDescription: { type: 'string' },
                longDescription: { type: 'string' },
            },
            required: ['themeParagraph', 'shortDescription', 'longDescription'],
        };
        const themePrompt = `Create a casino theme for "${casinoName}" based on the user prompt: "${userPrompt}"\n\nGenerate:\n1) themeParagraph (2-3 sentences)\n2) shortDescription (1 sentence)\n3) longDescription (3-4 sentences)\nReturn ONLY JSON with those keys.`;
        const themeResult = await this.gen.generateStructuredOutputWithRetry(themePrompt, themeSchema, { maxTokens: 1200 });
        await setStepResults({ theme: themeResult });
        this.gateway.emitToJob(jobId, 'builder:preview', { jobId, theme: themeResult });
        await updateProgress(25, OrchestratorService_1.Step.Colors);
        const colorsSchema = {
            type: 'object',
            properties: {
                selectedColors: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 7 },
                selectedFont: { type: 'string' },
            },
            required: ['selectedColors', 'selectedFont'],
        };
        const colorsPrompt = `Based on this casino theme: "${themeResult.themeParagraph}", select 3-7 hex colors and a web-safe font. Return { selectedColors, selectedFont }.`;
        const colorsResult = await this.gen.generateStructuredOutputWithRetry(colorsPrompt, colorsSchema, { maxTokens: 800 });
        await setStepResults({ colors: colorsResult });
        this.gateway.emitToJob(jobId, 'builder:preview', { jobId, colors: colorsResult.selectedColors, font: colorsResult.selectedFont });
        await updateProgress(40, OrchestratorService_1.Step.ParallelPlan);
        const imagePromptsSchema = {
            type: 'object',
            properties: {
                bannerImagePrompt: { type: 'string' },
                profileImagePrompt: { type: 'string' },
            },
            required: ['bannerImagePrompt', 'profileImagePrompt'],
        };
        const imagePromptsPrompt = `Based on theme: "${themeResult.themeParagraph}", create detailed prompts for a wide banner and a square profile image. Return { bannerImagePrompt, profileImagePrompt }.`;
        const games = this.registry.getSupportedGames();
        const gamePlanSchema = {
            type: 'object',
            properties: {
                gameSections: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            sectionName: { type: 'string' },
                            layout: { type: 'string', enum: ['grid', 'list', 'carousel'] },
                            games: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        gameId: { type: 'string' },
                                        subTheme: { type: 'string' },
                                        iconPrompt: { type: 'string' },
                                    },
                                    required: ['gameId', 'subTheme', 'iconPrompt'],
                                },
                            },
                        },
                        required: ['sectionName', 'layout', 'games'],
                    },
                },
            },
            required: ['gameSections'],
        };
        const exampleJson = {
            gameSections: [
                {
                    sectionName: 'Featured',
                    layout: 'grid',
                    games: [
                        { gameId: games[0] || 'dice', subTheme: 'micro-theme here', iconPrompt: 'short icon prompt' },
                    ],
                },
            ],
        };
        const gamePlanPrompt = `Plan sections and game sub-themes for "${casinoName}".\nTHEME: ${themeResult.themeParagraph}\nCOLORS: ${colorsResult.selectedColors.join(', ')}\nSUPPORTED GAMES: ${games.join(', ')}\n
REQUIREMENTS:\n- Create 1-3 sections\n- Each section MUST include: sectionName, layout ('grid'|'list'|'carousel'), games (non-empty array)\n- Each game MUST include: gameId (from SUPPORTED GAMES), subTheme, iconPrompt\n- Return ONLY a json object with keys exactly as in the example\n
EXAMPLE (structure only):\n${JSON.stringify(exampleJson, null, 2)}\n`;
        const [imagePrompts, gamePlan] = await Promise.all([
            this.gen.generateStructuredOutputWithRetry(imagePromptsPrompt, imagePromptsSchema, { maxTokens: 800 }),
            this.gen.generateStructuredOutputWithRetry(gamePlanPrompt, gamePlanSchema, { maxTokens: 1400 }),
        ]);
        await setStepResults({ imagePrompts, gameContent: gamePlan });
        this.gateway.emitToJob(jobId, 'builder:preview', { jobId, plannedSections: gamePlan.gameSections || [], imagePrompts });
        const plannedSections = gamePlan.gameSections || [];
        if (!Array.isArray(plannedSections) || plannedSections.length === 0) {
            throw new Error('AI returned no sections');
        }
        const plannedGameIds = new Set();
        for (const section of plannedSections) {
            if (!Array.isArray(section.games) || section.games.length === 0) {
                throw new Error(`Section ${section.sectionName || '(unnamed)'} contains no games`);
            }
            for (const g of section.games) {
                if (!g?.gameId)
                    throw new Error('Planned game missing gameId');
                if (!this.registry.isGameSupported(g.gameId)) {
                    throw new Error(`Unsupported game planned: ${g.gameId}`);
                }
                plannedGameIds.add(g.gameId);
            }
        }
        await updateProgress(70, OrchestratorService_1.Step.DesignGames);
        const designedGames = [];
        for (const section of plannedSections) {
            for (const g of section.games) {
                const design = await this.gameDesign.designGame(g.gameId, casinoName, themeResult.themeParagraph, colorsResult.selectedColors, colorsResult.selectedFont, g.subTheme, g.iconPrompt);
                designedGames.push({ type: g.gameId, name: design.gameName, config: design.designParameters, imagePrompts: design.imagePrompts || {} });
            }
        }
        if (designedGames.length === 0) {
            throw new Error('No designed games were generated');
        }
        await setStepResults({ gameElements: { games: designedGames } });
        await updateProgress(85, OrchestratorService_1.Step.Images);
        const imgs = await this.imageGen.generateCasinoImages(jobId, job.userAddress, {
            bannerImagePrompt: imagePrompts.bannerImagePrompt,
            profileImagePrompt: imagePrompts.profileImagePrompt,
        });
        const bannerUrl = imgs.bannerImage;
        const logoUrl = imgs.profileImage;
        this.gateway.emitToJob(jobId, 'builder:preview', { jobId, bannerImage: bannerUrl, profileImage: logoUrl });
        await updateProgress(90, OrchestratorService_1.Step.ResolvingImages);
        for (let i = 0; i < designedGames.length; i++) {
            const dg = designedGames[i];
            const resolved = await this.resolveImagePlaceholders(jobId, job.userAddress, dg.type, themeResult.themeParagraph, colorsResult.selectedColors, dg.config, dg.imagePrompts || {});
            designedGames[i].config = resolved;
            this.gateway.emitToJob(jobId, 'builder:preview', { jobId, game: { type: dg.type, name: dg.name, config: resolved } });
            try {
                const validation = this.registry.validateParams(dg.type, resolved);
                if (validation.success && validation.data) {
                    designedGames[i].config = validation.data;
                }
                else if (!validation.success) {
                    this.logger.warn(`[${jobId}] Validation failed for ${dg.type}: ${validation.error}`);
                }
            }
            catch (e) {
                this.logger.warn(`[${jobId}] Validation error for ${dg.type}: ${String(e?.message || e)}`);
            }
        }
        await updateProgress(92, OrchestratorService_1.Step.Persisting);
        const typeToCustomGameId = new Map();
        await this.prisma.$transaction(async (tx) => {
            for (const g of designedGames) {
                await tx.game.upsert({
                    where: { name: g.type },
                    update: {},
                    create: { name: g.type, displayName: toTitle(g.type), description: `${toTitle(g.type)} game` },
                });
                const cg = await tx.customGame.create({
                    data: { gameType: g.type, name: g.name, description: `${g.name} - generated design` },
                });
                const params = { ...g.config };
                await tx.customGameConfig.create({
                    data: { gameId: cg.id, name: g.name, description: `${g.name} configuration`, parameters: params },
                });
                typeToCustomGameId.set(g.type, cg.id);
            }
            let sectionOrder = 0;
            for (const s of plannedSections) {
                const gameIds = (s.games || [])
                    .map((x) => typeToCustomGameId.get(x.gameId))
                    .filter((id) => !!id);
                if (gameIds.length === 0) {
                    throw new Error(`Section ${s.sectionName || '(unnamed)'} maps to zero CustomGames`);
                }
                await tx.section.create({
                    data: { title: s.sectionName || 'Games', layout: s.layout || 'grid', order: sectionOrder++, gameIds },
                });
            }
        });
        await updateProgress(94, OrchestratorService_1.Step.Finalizing);
        for (const g of designedGames) {
            const customGameId = typeToCustomGameId.get(g.type);
            const config = await this.prisma.customGameConfig.findUnique({ where: { gameId: customGameId } });
            const params = config?.parameters || {};
            const hasIcon = typeof params?.gameIcon === 'string' && params.gameIcon.length > 0;
            if (!hasIcon) {
                const iconUrl = await this.imageGen.generateGameIcon(jobId, job.userAddress, g.type, g.name, themeResult.themeParagraph, colorsResult.selectedColors);
                await this.prisma.customGameConfig.update({ where: { gameId: customGameId }, data: { parameters: { ...params, gameIcon: iconUrl } } });
            }
        }
        const finalResult = {
            id: jobId,
            ownerAddress: job.userAddress,
            title: casinoName,
            shortDescription: themeResult.shortDescription,
            longDescription: themeResult.longDescription,
            themeParagraph: themeResult.themeParagraph,
            font: colorsResult.selectedFont,
            colors: colorsResult.selectedColors,
            bannerImage: bannerUrl,
            profileImage: logoUrl,
            sections: plannedSections.map((s) => ({
                title: s.sectionName,
                gameIds: (s.games || []).map((x) => x.gameId),
                layout: s.layout || 'grid',
            })),
            games: designedGames,
        };
        const jsonResult = {
            id: finalResult.id,
            ownerAddress: finalResult.ownerAddress ?? null,
            title: finalResult.title,
            shortDescription: finalResult.shortDescription,
            longDescription: finalResult.longDescription,
            themeParagraph: finalResult.themeParagraph,
            font: finalResult.font,
            colors: [...finalResult.colors],
            bannerImage: finalResult.bannerImage ?? null,
            profileImage: finalResult.profileImage ?? null,
            sections: finalResult.sections.map((s) => ({ title: s.title, gameIds: [...s.gameIds], layout: s.layout })),
            games: finalResult.games.map((g) => ({ type: g.type, name: g.name, config: g.config, imagePrompts: g.imagePrompts })),
        };
        await this.prisma.casinoDesignJob.update({
            where: { id: jobId },
            data: { status: 'COMPLETE', progress: 100, result: jsonResult, completedAt: new Date() },
        });
        this.gateway.emitToJob(jobId, 'builder:jobSucceeded', { jobId, result: finalResult });
        const durationMs = Date.now() - startedAtMs;
        this.logger.log(`[${jobId}] Orchestrator done in ${durationMs}ms`);
    }
    async resolveImagePlaceholders(jobId, userAddress, gameId, themeParagraph, colorPalette, params, imagePrompts) {
        const refs = [];
        const collect = (value, path) => {
            if (typeof value === 'string') {
                if (value.startsWith('image:')) {
                    refs.push({ key: value.slice('image:'.length), path });
                }
                return;
            }
            if (Array.isArray(value)) {
                value.forEach((v, i) => collect(v, `${path}_${i}`));
                return;
            }
            if (value && typeof value === 'object') {
                if (typeof value.url === 'string' && value.url.startsWith('image:')) {
                    refs.push({ key: value.url.slice('image:'.length), path: `${path}.url`, isUrlField: true });
                }
                Object.entries(value).forEach(([k, v]) => collect(v, path ? `${path}.${k}` : k));
            }
        };
        collect(params, '');
        const keyToPrompt = new Map();
        for (const r of refs) {
            if (!keyToPrompt.has(r.key)) {
                const fallback = `Asset for ${gameId} field ${r.path}`;
                keyToPrompt.set(r.key, imagePrompts[r.key] || `${fallback}. Theme: ${themeParagraph}. Colors: ${colorPalette.join(', ')}`);
            }
        }
        const entries = Array.from(keyToPrompt.entries());
        const results = await Promise.allSettled(entries.map(([key, prompt]) => this.imageGen.generateAsset(jobId, userAddress, prompt, `builder/assets/${gameId}/${key}`)));
        const keyToUrl = new Map();
        results.forEach((res, idx) => {
            const key = entries[idx][0];
            if (res.status === 'fulfilled' && res.value?.length !== 0) {
                keyToUrl.set(key, res.value);
            }
        });
        const replace = (value) => {
            if (typeof value === 'string') {
                if (value.startsWith('image:')) {
                    const key = value.slice('image:'.length);
                    return keyToUrl.get(key) || value;
                }
                return value;
            }
            if (Array.isArray(value)) {
                return value.map((v) => replace(v));
            }
            if (value && typeof value === 'object') {
                if (typeof value.url === 'string' && value.url.startsWith('image:')) {
                    const key = value.url.slice('image:'.length);
                    return { ...value, url: keyToUrl.get(key) || value.url };
                }
                const out = {};
                for (const [k, v] of Object.entries(value)) {
                    out[k] = replace(v);
                }
                return out;
            }
            return value;
        };
        return replace(params);
    }
};
exports.OrchestratorService = OrchestratorService;
OrchestratorService.Step = {
    Theme: 'theme',
    Colors: 'colors',
    ParallelPlan: 'parallel:imagePrompts+gamePlan',
    DesignGames: 'designGames',
    Images: 'images',
    ResolvingImages: 'resolvingImages',
    Persisting: 'persistingEntities',
    Finalizing: 'finalizingAssets',
    Complete: 'complete',
};
exports.OrchestratorService = OrchestratorService = OrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        builder_gateway_1.BuilderGateway,
        schema_registry_service_1.SchemaRegistryService,
        ai_generation_service_1.AIGenerationService,
        ai_image_service_1.AIImageGenerationService,
        ai_game_design_service_1.AIGameDesignService])
], OrchestratorService);
//# sourceMappingURL=orchestrator.service.js.map
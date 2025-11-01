import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BuilderGateway } from '@/api/gateways/builder.gateway';
import { SchemaRegistryService } from './schema-registry.service';
import { AIGenerationService } from './ai-generation.service';
import { AIImageGenerationService } from './ai-image.service';
import { AIGameDesignService } from './ai-game-design.service';
import { Prisma } from '@prisma/client';
import type {
  ThemeStepResult,
  ColorsStepResult,
  ImagePromptsStepResult,
  GamePlanResult,
  DesignedGame,
  FinalDesignResult,
} from './types';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private static readonly Step = {
    Theme: 'theme',
    Colors: 'colors',
    ParallelPlan: 'parallel:imagePrompts+gamePlan',
    DesignGames: 'designGames',
    Images: 'images',
    ResolvingImages: 'resolvingImages',
    Persisting: 'persistingEntities',
    Finalizing: 'finalizingAssets',
    Complete: 'complete',
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly gateway: BuilderGateway,
    private readonly registry: SchemaRegistryService,
    private readonly gen: AIGenerationService,
    private readonly imageGen: AIImageGenerationService,
    private readonly gameDesign: AIGameDesignService,
  ) {}

  async executeDesign(jobId: string): Promise<void> {
    const startedAtMs = Date.now();
    let lastStepStart = startedAtMs;
    let lastStepName = 'init';
    this.logger.log(`[${jobId}] Orchestrator start`);

    const job = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const casinoName = job.casinoName || 'My Casino';
    const userPrompt = job.userPrompt || '';
    this.logger.debug(`[${jobId}] Input: casinoName="${casinoName}", promptLen=${userPrompt.length}`);

    const updateProgress = async (progress: number, step: string) => {
      // metrics for last step
      const now = Date.now();
      const duration = now - lastStepStart;
      try {
        this.gateway.emitToJob(jobId, 'builder:metrics', { jobId, step: lastStepName, ms: duration });
      } catch {}
      lastStepStart = now;
      lastStepName = step;
      await this.prisma.casinoDesignJob.update({ where: { id: jobId }, data: { progress, currentStep: step, status: 'PROCESSING' } });
      this.gateway.emitToJob(jobId, 'builder:jobProgress', { jobId, progress, step });
    };

    const setStepResults = async (data: Record<string, any>) => {
      const current = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
      const prev = (current?.stepResults as any) || {};
      await this.prisma.casinoDesignJob.update({ where: { id: jobId }, data: { stepResults: { ...prev, ...data } as any } });
    };

    const toTitle = (s: string) => s.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Step 1: Theme paragraph + descriptions
    await updateProgress(10, OrchestratorService.Step.Theme);
    const themeSchema = {
      type: 'object',
      properties: {
        themeParagraph: { type: 'string' },
        shortDescription: { type: 'string' },
        longDescription: { type: 'string' },
      },
      required: ['themeParagraph', 'shortDescription', 'longDescription'],
    } as const;
    const themePrompt = `Create a casino theme for "${casinoName}" based on the user prompt: "${userPrompt}"\n\nGenerate:\n1) themeParagraph (2-3 sentences)\n2) shortDescription (1 sentence)\n3) longDescription (3-4 sentences)\nReturn ONLY JSON with those keys.`;
    const themeResult = await this.gen.generateStructuredOutputWithRetry<ThemeStepResult>(themePrompt, themeSchema, { maxTokens: 1200 });
    await setStepResults({ theme: themeResult });
    // Preview: theme text
    this.gateway.emitToJob(jobId, 'builder:preview', { jobId, theme: themeResult });

    // Step 2: Colors and font
    await updateProgress(25, OrchestratorService.Step.Colors);
    const colorsSchema = {
      type: 'object',
      properties: {
        selectedColors: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 7 },
        selectedFont: { type: 'string' },
      },
      required: ['selectedColors', 'selectedFont'],
    } as const;
    const colorsPrompt = `Based on this casino theme: "${themeResult.themeParagraph}", select 3-7 hex colors and a web-safe font. Return { selectedColors, selectedFont }.`;
    const colorsResult = await this.gen.generateStructuredOutputWithRetry<ColorsStepResult>(colorsPrompt, colorsSchema, { maxTokens: 800 });
    await setStepResults({ colors: colorsResult });
    // Preview: palette and font
    this.gateway.emitToJob(jobId, 'builder:preview', { jobId, colors: colorsResult.selectedColors, font: colorsResult.selectedFont });

    // Steps 3 & 4: image prompts + game plan (parallel)
    await updateProgress(40, OrchestratorService.Step.ParallelPlan);
    const imagePromptsSchema = {
      type: 'object',
      properties: {
        bannerImagePrompt: { type: 'string' },
        profileImagePrompt: { type: 'string' },
      },
      required: ['bannerImagePrompt', 'profileImagePrompt'],
    } as const;
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
    } as const;
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
      this.gen.generateStructuredOutputWithRetry<ImagePromptsStepResult>(imagePromptsPrompt, imagePromptsSchema, { maxTokens: 800 }),
      this.gen.generateStructuredOutputWithRetry<GamePlanResult>(gamePlanPrompt, gamePlanSchema, { maxTokens: 1400 }),
    ]);
    await setStepResults({ imagePrompts, gameContent: gamePlan });
    // Preview: planned sections and prompts
    this.gateway.emitToJob(jobId, 'builder:preview', { jobId, plannedSections: gamePlan.gameSections || [], imagePrompts });

    // Validate planned games
    const plannedSections = gamePlan.gameSections || [];
    if (!Array.isArray(plannedSections) || plannedSections.length === 0) {
      throw new Error('AI returned no sections');
    }
    const plannedGameIds = new Set<string>();
    for (const section of plannedSections) {
      if (!Array.isArray(section.games) || section.games.length === 0) {
        throw new Error(`Section ${section.sectionName || '(unnamed)'} contains no games`);
      }
      for (const g of section.games) {
        if (!g?.gameId) throw new Error('Planned game missing gameId');
        if (!this.registry.isGameSupported(g.gameId)) {
          throw new Error(`Unsupported game planned: ${g.gameId}`);
        }
        plannedGameIds.add(g.gameId);
      }
    }

    // Step 5: Design per-game elements
    await updateProgress(70, OrchestratorService.Step.DesignGames);
    const designedGames: DesignedGame[] = [];
    for (const section of plannedSections) {
      for (const g of section.games) {
        const design = await this.gameDesign.designGame(
          g.gameId,
          casinoName,
          themeResult.themeParagraph,
          colorsResult.selectedColors,
          colorsResult.selectedFont,
          g.subTheme,
          g.iconPrompt,
        );
        designedGames.push({ type: g.gameId, name: design.gameName, config: design.designParameters, imagePrompts: design.imagePrompts || {} });
      }
    }
    if (designedGames.length === 0) {
      throw new Error('No designed games were generated');
    }
    await setStepResults({ gameElements: { games: designedGames } });

    // Images for casino (banner/profile)
    await updateProgress(85, OrchestratorService.Step.Images);
    const imgs = await this.imageGen.generateCasinoImages(jobId, job.userAddress, {
      bannerImagePrompt: imagePrompts.bannerImagePrompt,
      profileImagePrompt: imagePrompts.profileImagePrompt,
    });
    const bannerUrl = imgs.bannerImage;
    const logoUrl = imgs.profileImage;
    // Preview: top-level images
    this.gateway.emitToJob(jobId, 'builder:preview', { jobId, bannerImage: bannerUrl, profileImage: logoUrl });

    // Resolve image placeholders in design parameters using provided imagePrompts
    await updateProgress(90, OrchestratorService.Step.ResolvingImages);
    for (let i = 0; i < designedGames.length; i++) {
      const dg = designedGames[i];
      const resolved = await this.resolveImagePlaceholders(
        jobId,
        job.userAddress,
        dg.type,
        themeResult.themeParagraph,
        colorsResult.selectedColors,
        dg.config,
        dg.imagePrompts || {}
      );
      designedGames[i].config = resolved;
      // Per-game preview as assets resolve
      this.gateway.emitToJob(jobId, 'builder:preview', { jobId, game: { type: dg.type, name: dg.name, config: resolved } });
      // Validate against registry for schema alignment (logs warning on failure)
      try {
        const validation = this.registry.validateParams(dg.type, resolved);
        if (validation.success && validation.data) {
          designedGames[i].config = validation.data;
        } else if (!validation.success) {
          this.logger.warn(`[${jobId}] Validation failed for ${dg.type}: ${validation.error}`);
        }
      } catch (e) {
        this.logger.warn(`[${jobId}] Validation error for ${dg.type}: ${String((e as any)?.message || e)}`);
      }
    }

    // Persist entities atomically; no defaults
    await updateProgress(92, OrchestratorService.Step.Persisting);
    const typeToCustomGameId = new Map<string, string>();

    await this.prisma.$transaction(async (tx) => {
      // Upsert base Games, create CustomGames and Configs
      for (const g of designedGames) {
        await tx.game.upsert({
          where: { name: g.type },
          update: {},
          create: { name: g.type, displayName: toTitle(g.type), description: `${toTitle(g.type)} game` },
        });
        const cg = await tx.customGame.create({
          data: { gameType: g.type, name: g.name, description: `${g.name} - generated design` },
        });
        // Ensure parameters include a gameIcon; fill after transaction if needed
        const params = { ...(g.config as any) };
        await tx.customGameConfig.create({
          data: { gameId: cg.id, name: g.name, description: `${g.name} configuration`, parameters: params as any },
        });
        typeToCustomGameId.set(g.type, cg.id);
      }

      // Create Sections; require all referenced games exist
      let sectionOrder = 0;
      for (const s of plannedSections) {
        const gameIds = (s.games || [])
          .map((x: any) => typeToCustomGameId.get(x.gameId))
          .filter((id: string | undefined): id is string => !!id);
        if (gameIds.length === 0) {
          throw new Error(`Section ${s.sectionName || '(unnamed)'} maps to zero CustomGames`);
        }
        await tx.section.create({
          data: { title: s.sectionName || 'Games', layout: s.layout || 'grid', order: sectionOrder++, gameIds },
        });
      }
    });

    // Post-transaction: generate icons if missing and patch configs
    await updateProgress(94, OrchestratorService.Step.Finalizing);
    for (const g of designedGames) {
      const customGameId = typeToCustomGameId.get(g.type)!;
      const config = await this.prisma.customGameConfig.findUnique({ where: { gameId: customGameId } });
      const params = (config?.parameters as any) || {};
      const hasIcon = typeof params?.gameIcon === 'string' && params.gameIcon.length > 0;
      if (!hasIcon) {
        const iconUrl = await this.imageGen.generateGameIcon(jobId, job.userAddress, g.type, g.name, themeResult.themeParagraph, colorsResult.selectedColors);
        await this.prisma.customGameConfig.update({ where: { gameId: customGameId }, data: { parameters: { ...params, gameIcon: iconUrl } as any } });
      }
    }

    // Build final result
    const finalResult: FinalDesignResult = {
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
      sections: plannedSections.map((s: any) => ({
        title: s.sectionName,
        gameIds: (s.games || []).map((x: any) => x.gameId),
        layout: s.layout || 'grid',
      })),
      games: designedGames,
    };

    // Persist and complete
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
    } as Prisma.InputJsonValue;

    await this.prisma.casinoDesignJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETE', progress: 100, result: jsonResult, completedAt: new Date() },
    });
    this.gateway.emitToJob(jobId, 'builder:jobSucceeded', { jobId, result: finalResult });

    const durationMs = Date.now() - startedAtMs;
    this.logger.log(`[${jobId}] Orchestrator done in ${durationMs}ms`);
  }

  /**
   * Replace any "image:<key>" placeholders in params (including arrays and nested objects)
   * by generating images using imagePrompts[key] and uploading via MediaStorageService.
   */
  private async resolveImagePlaceholders(
    jobId: string,
    userAddress: string | undefined,
    gameId: string,
    themeParagraph: string,
    colorPalette: string[],
    params: any,
    imagePrompts: Record<string, string>,
  ): Promise<any> {
    // Collect placeholders first
    type PlaceholderRef = { key: string; path: string; isUrlField?: boolean };
    const refs: PlaceholderRef[] = [];

    const collect = (value: any, path: string) => {
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

    // Generate assets for unique keys in parallel
    const keyToPrompt = new Map<string, string>();
    for (const r of refs) {
      if (!keyToPrompt.has(r.key)) {
        const fallback = `Asset for ${gameId} field ${r.path}`;
        keyToPrompt.set(r.key, imagePrompts[r.key] || `${fallback}. Theme: ${themeParagraph}. Colors: ${colorPalette.join(', ')}`);
      }
    }

    const entries = Array.from(keyToPrompt.entries());
    const results = await Promise.allSettled(entries.map(([key, prompt]) =>
      this.imageGen.generateAsset(jobId, userAddress, prompt, `builder/assets/${gameId}/${key}`)
    ));

    const keyToUrl = new Map<string, string>();
    results.forEach((res, idx) => {
      const key = entries[idx][0];
      if (res.status === 'fulfilled' && res.value?.length !== 0) {
        keyToUrl.set(key, res.value);
      }
    });

    // Replace placeholders
    const replace = (value: any): any => {
      if (typeof value === 'string') {
        if (value.startsWith('image:')) {
          const key = value.slice('image:'.length);
          return keyToUrl.get(key) || value; // keep original if not generated
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
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(value)) {
          out[k] = replace(v);
        }
        return out;
      }
      return value;
    };

    return replace(params);
  }
}



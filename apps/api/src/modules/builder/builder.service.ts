import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@/modules/queue/queue.module';
import type { FinalDesignResult, PersistedTheme } from './types';
import { Prisma } from '@prisma/client';

@Injectable()
export class BuilderService {
  private readonly logger = new Logger(BuilderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(QUEUE_NAMES.BUILDER_DESIGN) private readonly designQueue: Queue,
    @InjectQueue(QUEUE_NAMES.BUILDER_ELEMENT) private readonly elementQueue: Queue,
  ) {}

  async createDesignJob(casinoName: string, prompt: string, options?: any) {
    const userAddress: string | undefined = options?.userAddress || this.config.get<string>('SOLANA_OWNER_ADDRESS') || undefined;
    const data: any = {
      casinoName,
      userPrompt: prompt,
      config: options || {},
      stepResults: {},
    };
    if (userAddress) data.user = { connect: { walletAddress: userAddress } };
    const job = await this.prisma.casinoDesignJob.create({ data });

    await this.designQueue.add('design', { jobId: job.id }, { removeOnComplete: 1000, removeOnFail: 1000 });
    return job;
  }

  async createElementJob(gameType: string, prompt: string, parameterId?: string, options?: any) {
    const userAddress: string | undefined = options?.userAddress || this.config.get<string>('SOLANA_OWNER_ADDRESS') || undefined;
    const data2: any = {
      gameType,
      userPrompt: prompt,
      finalPrompt: prompt,
      parameterId,
      config: options || {},
    };
    if (userAddress) data2.user = { connect: { walletAddress: userAddress } };
    const job = await this.prisma.elementGenerationJob.create({ data: data2 });
    await this.elementQueue.add('element', { jobId: job.id }, { removeOnComplete: 1000, removeOnFail: 1000 });
    return job;
  }

  async listJobs(type?: 'design' | 'element', limit = 20, offset = 0) {
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

  async getJob(id: string) {
    const job = await this.prisma.casinoDesignJob.findUnique({ where: { id }, include: { generatedImages: true } });
    if (job) return job;
    return this.prisma.elementGenerationJob.findUnique({ where: { id }, include: { generatedImages: true } });
  }

  async applyDesign(jobId: string) {
    const job = await this.prisma.casinoDesignJob.findUnique({ where: { id: jobId } });
    if (!job || !job.result) {
      throw new Error('Design job not complete');
    }

    // Extract theme & assets from job.result without unsafe casts
    const rawResult: unknown = job.result;
    const isFinalDesignResult = (v: unknown): v is FinalDesignResult => {
      if (!v || typeof v !== 'object') return false;
      const o: any = v;
      return (
        typeof o.id === 'string' &&
        typeof o.title === 'string' &&
        typeof o.themeParagraph === 'string' &&
        Array.isArray(o.colors) && o.colors.every((c: any) => typeof c === 'string') &&
        typeof o.font === 'string'
      );
    };

    const stepResults = (job.stepResults || {}) as Record<string, unknown>;
    const colorsStep = stepResults?.colors as { selectedColors?: string[]; selectedFont?: string } | undefined;

    let theme: PersistedTheme;
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
    } else {
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
    } as const satisfies Prisma.InputJsonValue;

    const baseUpdate: Prisma.CasinoSettingsUpdateInput = {
      name: job.casinoName,
      primaryColor: theme.colors?.[0] || undefined,
      logoUrl: theme.assets?.logoUrl || undefined,
      bannerUrl: theme.assets?.bannerUrl || undefined,
    };
    const updateData: Prisma.CasinoSettingsUpdateInput & { theme?: Prisma.InputJsonValue } = {
      ...baseUpdate,
      theme: themeJson,
    };
    const updated = await this.prisma.casinoSettings.update({
      where: { id: 'singleton' },
      data: updateData,
    });

    return { applied: true, settings: updated };
  }
}



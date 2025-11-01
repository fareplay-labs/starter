import { Injectable, Logger } from '@nestjs/common';
import { AIGenerationService } from './ai-generation.service';
import { MediaStorageService } from './media-storage.service';

@Injectable()
export class AIImageGenerationService {
  private readonly logger = new Logger(AIImageGenerationService.name);

  constructor(
    private readonly gen: AIGenerationService,
    private readonly media: MediaStorageService,
  ) {}

  async generateCasinoImages(jobId: string, userAddress: string | undefined, prompts: { bannerImagePrompt: string; profileImagePrompt: string }) {
    if (!prompts.bannerImagePrompt || !prompts.profileImagePrompt) {
      throw new Error('Missing image prompts');
    }

    const [banner, profile] = await Promise.all([
      this.gen.generateImage(prompts.bannerImagePrompt),
      this.gen.generateImage(prompts.profileImagePrompt),
    ]);

    const [uploadedBanner, uploadedProfile] = await Promise.all([
      this.media.uploadFromUrl(banner.url, 'builder/banners'),
      this.media.uploadFromUrl(profile.url, 'builder/profiles'),
    ]);

    if (userAddress) {
      await Promise.all([
        this.media.recordGeneratedImage({ jobId, userAddress, prompt: prompts.bannerImagePrompt, imageUrl: uploadedBanner.imageUrl, s3Key: uploadedBanner.s3Key }),
        this.media.recordGeneratedImage({ jobId, userAddress, prompt: prompts.profileImagePrompt, imageUrl: uploadedProfile.imageUrl, s3Key: uploadedProfile.s3Key }),
      ]);
    }

    return { bannerImage: uploadedBanner.imageUrl, profileImage: uploadedProfile.imageUrl };
  }

  async generateGameIcon(jobId: string, userAddress: string | undefined, gameType: string, gameName: string, themeContext: string, colorPalette: string[], iconPrompt?: string): Promise<string> {
    const prompt = (iconPrompt && iconPrompt.trim().length > 0)
      ? iconPrompt
      : `Create a SINGLE, SIMPLE icon for a ${gameType} game called "${gameName}".
THEME: ${themeContext}
COLORS: ${colorPalette.join(', ')}
REQUIREMENTS:
- One simple symbol only, transparent background, no text.
- Works at 64x64px.
- Cohesive with theme/colors.`;

    const image = await this.gen.generateImage(prompt);
    const uploaded = await this.media.uploadFromUrl(image.url, `builder/icons/${gameType}`);
    if (userAddress) {
      await this.media.recordGeneratedImage({ jobId, userAddress, prompt, imageUrl: uploaded.imageUrl, s3Key: uploaded.s3Key });
    }
    return uploaded.imageUrl;
  }

  async generateAsset(jobId: string, userAddress: string | undefined, prompt: string, keyPrefix = 'builder/assets'): Promise<string> {
    const image = await this.gen.generateImage(prompt);
    const uploaded = await this.media.uploadFromUrl(image.url, keyPrefix);
    if (userAddress) {
      await this.media.recordGeneratedImage({ jobId, userAddress, prompt, imageUrl: uploaded.imageUrl, s3Key: uploaded.s3Key });
    }
    return uploaded.imageUrl;
  }
}

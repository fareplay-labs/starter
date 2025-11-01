import { AIGenerationService } from './ai-generation.service';
import { MediaStorageService } from './media-storage.service';
export declare class AIImageGenerationService {
    private readonly gen;
    private readonly media;
    private readonly logger;
    constructor(gen: AIGenerationService, media: MediaStorageService);
    generateCasinoImages(jobId: string, userAddress: string | undefined, prompts: {
        bannerImagePrompt: string;
        profileImagePrompt: string;
    }): Promise<{
        bannerImage: string;
        profileImage: string;
    }>;
    generateGameIcon(jobId: string, userAddress: string | undefined, gameType: string, gameName: string, themeContext: string, colorPalette: string[], iconPrompt?: string): Promise<string>;
    generateAsset(jobId: string, userAddress: string | undefined, prompt: string, keyPrefix?: string): Promise<string>;
}

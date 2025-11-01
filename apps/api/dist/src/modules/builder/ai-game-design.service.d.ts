import { AIGenerationService } from './ai-generation.service';
import { SchemaRegistryService } from './schema-registry.service';
export declare class AIGameDesignService {
    private readonly gen;
    private readonly registry;
    private readonly logger;
    constructor(gen: AIGenerationService, registry: SchemaRegistryService);
    designGame(gameId: string, casinoName: string, themeParagraph: string, selectedColors: string[], selectedFont: string, subTheme: string, iconPrompt: string): Promise<{
        gameName: string;
        designParameters: any;
        imagePrompts: Record<string, string>;
    }>;
}

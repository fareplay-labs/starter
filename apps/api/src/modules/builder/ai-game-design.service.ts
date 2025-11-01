import { Injectable, Logger } from '@nestjs/common';
import { AIGenerationService } from './ai-generation.service';
import { SchemaRegistryService } from './schema-registry.service';

@Injectable()
export class AIGameDesignService {
  private readonly logger = new Logger(AIGameDesignService.name);

  constructor(
    private readonly gen: AIGenerationService,
    private readonly registry: SchemaRegistryService,
  ) {}

  async designGame(
    gameId: string,
    casinoName: string,
    themeParagraph: string,
    selectedColors: string[],
    selectedFont: string,
    subTheme: string,
    iconPrompt: string
  ): Promise<{ gameName: string; designParameters: any; imagePrompts: Record<string, string> }> {
    const schema = this.registry.getSchema(gameId);
    if (!schema) throw new Error(`Unknown game: ${gameId}`);

    const customInstructions = this.registry.extractCustomInstructions(gameId);
    const supportedTypes = this.registry.getSupportedTypesMetadata(gameId);

    const prompt = `You are designing a ${gameId} game for "${casinoName}" casino.

CASINO THEME: ${themeParagraph}
CASINO COLORS: ${selectedColors.join(', ')}
CASINO FONT: ${selectedFont}

GAME SUB-THEME: ${subTheme}
ICON STYLE REFERENCE: ${iconPrompt}

${customInstructions}

SUPPORTED TYPES FOR EACH FIELD:
${JSON.stringify(supportedTypes, null, 2)}

CRITICAL REQUIREMENTS:
1. Use ONLY the exact parameter names from the schema
2. For enum fields, use ONLY the exact values specified (case-sensitive)
3. For number fields, use ONLY values within specified ranges
4. For ALL color fields, use ONLY colors from the casino palette: ${selectedColors.join(', ')}
5. Do NOT invent new parameters
6. DO NOT output any schema/type descriptors (e.g., ZodEffects, ZodArray, type, optional). Output CONCRETE values ONLY.
7. For every field that supports images (supportsImage=true in SUPPORTED TYPES), DO NOT return a filename or URL directly. Instead return a placeholder string in the form "image:<key>".
   - For single image fields, use key = the exact field name (e.g., image:gameIcon, image:background).
   - For arrays of images (e.g., slotsSymbols), return an array of placeholders using indexed keys (e.g., image:slotsSymbols_0, image:slotsSymbols_1, ...).
   - For object fields containing a URL (e.g., { url: string }), set url to a placeholder (e.g., { "url": "image:background" }).
8. Populate imagePrompts with a mapping for EVERY placeholder you used, where the key matches the placeholder key after "image:" and the value is a detailed, descriptive image prompt that matches the theme and field intent.

Return ONLY a JSON object with this exact structure:
{
  "gameName": "Creative Game Name",
  "designParameters": {
  },
  "imagePrompts": {
  }
}`;

    const jsonSchema = {
      type: 'object',
      properties: {
        gameName: { type: 'string' },
        designParameters: { type: 'object' },
        imagePrompts: { type: 'object', additionalProperties: { type: 'string' } },
      },
      required: ['gameName', 'designParameters', 'imagePrompts'],
    } as const;

    return this.gen.generateStructuredOutputWithRetry(prompt, jsonSchema, { maxTokens: 1600 });
  }
}

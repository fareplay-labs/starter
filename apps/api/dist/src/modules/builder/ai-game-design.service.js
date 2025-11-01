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
var AIGameDesignService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGameDesignService = void 0;
const common_1 = require("@nestjs/common");
const ai_generation_service_1 = require("./ai-generation.service");
const schema_registry_service_1 = require("./schema-registry.service");
let AIGameDesignService = AIGameDesignService_1 = class AIGameDesignService {
    constructor(gen, registry) {
        this.gen = gen;
        this.registry = registry;
        this.logger = new common_1.Logger(AIGameDesignService_1.name);
    }
    async designGame(gameId, casinoName, themeParagraph, selectedColors, selectedFont, subTheme, iconPrompt) {
        const schema = this.registry.getSchema(gameId);
        if (!schema)
            throw new Error(`Unknown game: ${gameId}`);
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
        };
        return this.gen.generateStructuredOutputWithRetry(prompt, jsonSchema, { maxTokens: 1600 });
    }
};
exports.AIGameDesignService = AIGameDesignService;
exports.AIGameDesignService = AIGameDesignService = AIGameDesignService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_generation_service_1.AIGenerationService,
        schema_registry_service_1.SchemaRegistryService])
], AIGameDesignService);
//# sourceMappingURL=ai-game-design.service.js.map
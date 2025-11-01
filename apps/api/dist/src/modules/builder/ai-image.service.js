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
var AIImageGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIImageGenerationService = void 0;
const common_1 = require("@nestjs/common");
const ai_generation_service_1 = require("./ai-generation.service");
const media_storage_service_1 = require("./media-storage.service");
let AIImageGenerationService = AIImageGenerationService_1 = class AIImageGenerationService {
    constructor(gen, media) {
        this.gen = gen;
        this.media = media;
        this.logger = new common_1.Logger(AIImageGenerationService_1.name);
    }
    async generateCasinoImages(jobId, userAddress, prompts) {
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
    async generateGameIcon(jobId, userAddress, gameType, gameName, themeContext, colorPalette, iconPrompt) {
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
    async generateAsset(jobId, userAddress, prompt, keyPrefix = 'builder/assets') {
        const image = await this.gen.generateImage(prompt);
        const uploaded = await this.media.uploadFromUrl(image.url, keyPrefix);
        if (userAddress) {
            await this.media.recordGeneratedImage({ jobId, userAddress, prompt, imageUrl: uploaded.imageUrl, s3Key: uploaded.s3Key });
        }
        return uploaded.imageUrl;
    }
};
exports.AIImageGenerationService = AIImageGenerationService;
exports.AIImageGenerationService = AIImageGenerationService = AIImageGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_generation_service_1.AIGenerationService,
        media_storage_service_1.MediaStorageService])
], AIImageGenerationService);
//# sourceMappingURL=ai-image.service.js.map
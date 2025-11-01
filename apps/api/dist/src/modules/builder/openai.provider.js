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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAiProvider = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("openai");
const config_1 = require("@nestjs/config");
let OpenAiProvider = class OpenAiProvider {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.enabled = (this.config.get('AI_ENABLED') || '').toLowerCase() === 'true' || !!this.config.get('OPENAI_API_KEY');
    }
    getClient() {
        if (this.client)
            return this.client;
        const apiKey = this.config.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new Error('OpenAI disabled: missing OPENAI_API_KEY');
        }
        this.client = new openai_1.default({ apiKey });
        return this.client;
    }
    ensureJsonHint(prompt) {
        if (!/\bjson\b/i.test(prompt)) {
            return `${prompt}\n\nReturn only a json object.`;
        }
        return prompt;
    }
    async generateStructured(prompt, jsonSchema, cfg) {
        const model = cfg?.model || this.config.get('OPENAI_MODEL') || 'gpt-4o-mini';
        const maxTokens = cfg?.maxTokens || 1024;
        const temperature = cfg?.temperature ?? 0.7;
        if (!this.enabled)
            throw new Error('AI is disabled');
        const promptWithJson = this.ensureJsonHint(prompt);
        const response = await this.getClient().chat.completions.create({
            model,
            messages: [{ role: 'user', content: promptWithJson }],
            response_format: { type: 'json_object' },
            max_tokens: maxTokens,
            temperature,
        });
        const output = response?.choices?.[0]?.message?.content;
        try {
            return typeof output === 'string' ? JSON.parse(output) : output;
        }
        catch {
            return output;
        }
    }
    async generateImage(prompt, cfg) {
        const model = cfg?.model || this.config.get('IMAGE_MODEL') || 'dall-e-3';
        if (!this.enabled)
            throw new Error('AI is disabled');
        const image = await this.getClient().images.generate({
            model,
            prompt,
            size: '1024x1024',
        });
        const url = image?.data?.[0]?.url || '';
        return { url };
    }
};
exports.OpenAiProvider = OpenAiProvider;
exports.OpenAiProvider = OpenAiProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAiProvider);
//# sourceMappingURL=openai.provider.js.map
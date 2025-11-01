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
var AIGenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGenerationService = void 0;
const common_1 = require("@nestjs/common");
const openai_provider_1 = require("./openai.provider");
let AIGenerationService = AIGenerationService_1 = class AIGenerationService {
    constructor(openai) {
        this.openai = openai;
        this.logger = new common_1.Logger(AIGenerationService_1.name);
        this.rateLimiter = new Map();
        this.cache = new Map();
        this.circuitBreaker = {
            failures: 0,
            lastFailure: 0,
            state: 'CLOSED',
        };
    }
    hasRequiredFields(result, jsonSchema) {
        if (!jsonSchema || !jsonSchema.required)
            return true;
        const missing = jsonSchema.required.filter((k) => !(k in result));
        if (missing.length > 0)
            return false;
        if ('gameSections' in (jsonSchema.properties || {})) {
            const sections = result.gameSections;
            if (!Array.isArray(sections) || sections.length === 0)
                return false;
        }
        return true;
    }
    async generateStructuredOutput(prompt, jsonSchema, cfg) {
        const cacheKey = `structured:${prompt}`;
        if (this.cache.has(cacheKey)) {
            this.logger.debug('Cache hit (structured)');
            return this.cache.get(cacheKey);
        }
        await this.checkRateLimit('text');
        this.ensureCircuit();
        try {
            const result = await this.openai.generateStructured(prompt, jsonSchema, cfg);
            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
            this.resetCircuitOnSuccess();
            return result;
        }
        catch (err) {
            this.handleError(err);
            throw err;
        }
    }
    async generateStructuredOutputWithRetry(prompt, jsonSchema, cfg, maxRetries = 3) {
        let lastError = null;
        let currentPrompt = prompt;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await this.generateStructuredOutput(currentPrompt, jsonSchema, cfg);
                if (!this.hasRequiredFields(res, jsonSchema)) {
                    this.logger.warn(`Invalid structured output (missing required fields). Snippet: ${JSON.stringify(res).slice(0, 300)}...`);
                    throw new Error('Structured output missing required fields');
                }
                if (attempt > 1)
                    this.logger.log(`Structured output succeeded on attempt ${attempt}`);
                return res;
            }
            catch (e) {
                lastError = e;
                if (attempt < maxRetries) {
                    const requiredKeys = Array.isArray(jsonSchema?.required) ? jsonSchema.required.join(', ') : '';
                    this.logger.warn(`Attempt ${attempt} failed, retrying... Error: ${e.message}`);
                    currentPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a json object. Include ALL required keys: [${requiredKeys}]. Do NOT include any extra keys.`;
                }
            }
        }
        throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message || 'unknown'}`);
    }
    async generateImage(prompt, cfg) {
        const cacheKey = `image:${prompt}`;
        if (this.cache.has(cacheKey)) {
            this.logger.debug('Cache hit (image)');
            return this.cache.get(cacheKey);
        }
        await this.checkRateLimit('image');
        this.ensureCircuit();
        try {
            const res = await this.openai.generateImage(prompt, { model: cfg?.model });
            this.cache.set(cacheKey, res);
            setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
            this.resetCircuitOnSuccess();
            return res;
        }
        catch (err) {
            this.handleError(err);
            throw err;
        }
    }
    async checkRateLimit(kind) {
        const now = Date.now();
        const windowMs = 60_000;
        const limit = 50;
        if (!this.rateLimiter.has(kind))
            this.rateLimiter.set(kind, []);
        const events = this.rateLimiter.get(kind);
        const recent = events.filter(t => now - t < windowMs);
        this.rateLimiter.set(kind, recent);
        if (recent.length >= limit)
            throw new Error(`Rate limit exceeded for ${kind}`);
        recent.push(now);
    }
    ensureCircuit() {
        if (this.circuitBreaker.state === 'OPEN') {
            if (Date.now() - this.circuitBreaker.lastFailure > 60_000) {
                this.circuitBreaker.state = 'HALF_OPEN';
            }
            else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
    }
    resetCircuitOnSuccess() {
        if (this.circuitBreaker.state === 'HALF_OPEN') {
            this.circuitBreaker.state = 'CLOSED';
            this.circuitBreaker.failures = 0;
        }
    }
    handleError(error) {
        this.circuitBreaker.failures++;
        this.circuitBreaker.lastFailure = Date.now();
        if (this.circuitBreaker.failures >= 5) {
            this.circuitBreaker.state = 'OPEN';
            this.logger.error('Circuit breaker opened due to repeated failures');
        }
        this.logger.error('AI generation error', error);
    }
};
exports.AIGenerationService = AIGenerationService;
exports.AIGenerationService = AIGenerationService = AIGenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_provider_1.OpenAiProvider])
], AIGenerationService);
//# sourceMappingURL=ai-generation.service.js.map
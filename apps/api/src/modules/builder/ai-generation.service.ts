import { Injectable, Logger } from '@nestjs/common';
import { OpenAiProvider } from './openai.provider';

interface GenerationConfig {
  imageQuality?: 'low' | 'medium' | 'high';
  parallelProcessing?: boolean;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

@Injectable()
export class AIGenerationService {
  private readonly logger = new Logger(AIGenerationService.name);
  private rateLimiter: Map<string, number[]> = new Map();
  private cache = new Map<string, any>();
  private circuitBreaker: { failures: number; lastFailure: number; state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' } = {
    failures: 0,
    lastFailure: 0,
    state: 'CLOSED',
  };

  constructor(private readonly openai: OpenAiProvider) {}

  private hasRequiredFields(result: any, jsonSchema: any): boolean {
    if (!jsonSchema || !jsonSchema.required) return true;
    const missing = (jsonSchema.required as string[]).filter((k) => !(k in result));
    if (missing.length > 0) return false;
    if ('gameSections' in (jsonSchema.properties || {})) {
      const sections = (result as any).gameSections;
      if (!Array.isArray(sections) || sections.length === 0) return false;
    }
    return true;
  }

  async generateStructuredOutput<T>(prompt: string, jsonSchema: any, cfg?: GenerationConfig): Promise<T> {
    const cacheKey = `structured:${prompt}`;
    if (this.cache.has(cacheKey)) {
      this.logger.debug('Cache hit (structured)');
      return this.cache.get(cacheKey) as T;
    }
    await this.checkRateLimit('text');
    this.ensureCircuit();
    try {
      const result = await this.openai.generateStructured<T>(prompt, jsonSchema, cfg);
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      this.resetCircuitOnSuccess();
      return result;
    } catch (err) {
      this.handleError(err);
      throw err;
    }
  }

  async generateStructuredOutputWithRetry<T>(prompt: string, jsonSchema: any, cfg?: GenerationConfig, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null;
    let currentPrompt = prompt;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await this.generateStructuredOutput<T>(currentPrompt, jsonSchema, cfg);
        if (!this.hasRequiredFields(res, jsonSchema)) {
          // Log small snippet to aid debugging
          this.logger.warn(`Invalid structured output (missing required fields). Snippet: ${JSON.stringify(res).slice(0, 300)}...`);
          throw new Error('Structured output missing required fields');
        }
        if (attempt > 1) this.logger.log(`Structured output succeeded on attempt ${attempt}`);
        return res;
      } catch (e: any) {
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

  async generateImage(prompt: string, cfg?: GenerationConfig): Promise<{ url: string }> {
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
    } catch (err) {
      this.handleError(err);
      throw err;
    }
  }

  private async checkRateLimit(kind: 'text' | 'image'): Promise<void> {
    const now = Date.now();
    const windowMs = 60_000;
    const limit = 50;
    if (!this.rateLimiter.has(kind)) this.rateLimiter.set(kind, []);
    const events = this.rateLimiter.get(kind)!;
    const recent = events.filter(t => now - t < windowMs);
    this.rateLimiter.set(kind, recent);
    if (recent.length >= limit) throw new Error(`Rate limit exceeded for ${kind}`);
    recent.push(now);
  }

  private ensureCircuit(): void {
    if (this.circuitBreaker.state === 'OPEN') {
      if (Date.now() - this.circuitBreaker.lastFailure > 60_000) {
        this.circuitBreaker.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
  }

  private resetCircuitOnSuccess(): void {
    if (this.circuitBreaker.state === 'HALF_OPEN') {
      this.circuitBreaker.state = 'CLOSED';
      this.circuitBreaker.failures = 0;
    }
  }

  private handleError(error: any): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    if (this.circuitBreaker.failures >= 5) {
      this.circuitBreaker.state = 'OPEN';
      this.logger.error('Circuit breaker opened due to repeated failures');
    }
    this.logger.error('AI generation error', error);
  }
}

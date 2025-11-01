import { OpenAiProvider } from './openai.provider';
interface GenerationConfig {
    imageQuality?: 'low' | 'medium' | 'high';
    parallelProcessing?: boolean;
    model?: string;
    maxTokens?: number;
    temperature?: number;
}
export declare class AIGenerationService {
    private readonly openai;
    private readonly logger;
    private rateLimiter;
    private cache;
    private circuitBreaker;
    constructor(openai: OpenAiProvider);
    private hasRequiredFields;
    generateStructuredOutput<T>(prompt: string, jsonSchema: any, cfg?: GenerationConfig): Promise<T>;
    generateStructuredOutputWithRetry<T>(prompt: string, jsonSchema: any, cfg?: GenerationConfig, maxRetries?: number): Promise<T>;
    generateImage(prompt: string, cfg?: GenerationConfig): Promise<{
        url: string;
    }>;
    private checkRateLimit;
    private ensureCircuit;
    private resetCircuitOnSuccess;
    private handleError;
}
export {};

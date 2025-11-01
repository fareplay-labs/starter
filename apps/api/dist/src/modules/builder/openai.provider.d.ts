import { ConfigService } from '@nestjs/config';
interface GenerateConfig {
    model?: string;
    maxTokens?: number;
    temperature?: number;
}
export declare class OpenAiProvider {
    private readonly config;
    private client;
    private enabled;
    constructor(config: ConfigService);
    private getClient;
    private ensureJsonHint;
    generateStructured<T>(prompt: string, jsonSchema: any, cfg?: GenerateConfig): Promise<T>;
    generateImage(prompt: string, cfg?: GenerateConfig): Promise<{
        url: string;
    }>;
}
export {};

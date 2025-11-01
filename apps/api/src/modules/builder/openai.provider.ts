import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

interface GenerateConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

@Injectable()
export class OpenAiProvider {
  private client: OpenAI | null = null;
  private enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = (this.config.get<string>('AI_ENABLED') || '').toLowerCase() === 'true' || !!this.config.get<string>('OPENAI_API_KEY');
  }

  private getClient(): OpenAI {
    if (this.client) return this.client;
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OpenAI disabled: missing OPENAI_API_KEY');
    }
    this.client = new OpenAI({ apiKey });
    return this.client;
  }

  private ensureJsonHint(prompt: string): string {
    // OpenAI requires the word 'json' in messages when using response_format: json_object
    if (!/\bjson\b/i.test(prompt)) {
      return `${prompt}\n\nReturn only a json object.`;
    }
    return prompt;
  }

  async generateStructured<T>(prompt: string, jsonSchema: any, cfg?: GenerateConfig): Promise<T> {
    const model = cfg?.model || this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    const maxTokens = cfg?.maxTokens || 1024;
    const temperature = cfg?.temperature ?? 0.7;

    if (!this.enabled) throw new Error('AI is disabled');
    const promptWithJson = this.ensureJsonHint(prompt);
    const response = await this.getClient().chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptWithJson }],
      response_format: { type: 'json_object' },
      max_tokens: maxTokens,
      temperature,
    });

    const output = (response as any)?.choices?.[0]?.message?.content;

    try {
      return typeof output === 'string' ? JSON.parse(output) : (output as T);
    } catch {
      return output as T;
    }
  }

  async generateImage(prompt: string, cfg?: GenerateConfig): Promise<{ url: string }> {
    const model = cfg?.model || this.config.get<string>('IMAGE_MODEL') || 'dall-e-3';
    if (!this.enabled) throw new Error('AI is disabled');
    const image = await this.getClient().images.generate({
      model,
      prompt,
      size: '1024x1024',
    });
    const url = (image as any)?.data?.[0]?.url || '';
    return { url };
  }
}



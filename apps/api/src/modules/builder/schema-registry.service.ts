import { Injectable } from '@nestjs/common';
import { schemaRegistry } from './registry/schemaRegistry';

@Injectable()
export class SchemaRegistryService {
  getSchema(gameType: string): any {
    return schemaRegistry.getSchema(gameType);
  }

  getJsonSchema(gameType: string): any {
    return schemaRegistry.getJsonSchema(gameType);
  }

  getGameMetadata(gameType: string): any {
    return schemaRegistry.getGameMetadata(gameType);
  }

  extractCustomInstructions(gameType: string): string {
    return schemaRegistry.extractCustomInstructions(gameType);
  }

  getFieldInfo(gameType: string) {
    return schemaRegistry.getFieldInfo(gameType);
  }

  validateParams(gameType: string, params: any) {
    return schemaRegistry.validateParams(gameType, params);
  }

  getSupportedGames(): string[] {
    return schemaRegistry.getSupportedGames();
  }

  isGameSupported(gameType: string): boolean {
    return schemaRegistry.isGameSupported(gameType);
  }

  getSupportedTypesMetadata(gameType: string): Record<string, any> {
    return schemaRegistry.getSupportedTypesMetadata(gameType);
  }
}



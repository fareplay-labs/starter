export declare class SchemaRegistryService {
    getSchema(gameType: string): any;
    getJsonSchema(gameType: string): any;
    getGameMetadata(gameType: string): any;
    extractCustomInstructions(gameType: string): string;
    getFieldInfo(gameType: string): {
        name: string;
        type: string;
        description: string;
        default?: any;
        optional: boolean;
        supportsImage: boolean;
        supportsGradient: boolean;
        supportsSolidColor: boolean;
        supportsPattern: boolean;
        customInstruction?: string;
    }[];
    validateParams(gameType: string, params: any): {
        success: boolean;
        error?: string;
        data?: any;
    };
    getSupportedGames(): string[];
    isGameSupported(gameType: string): boolean;
    getSupportedTypesMetadata(gameType: string): Record<string, any>;
}

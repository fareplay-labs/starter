import { type z } from 'zod';
export interface ExtractedInstruction {
    fieldName: string;
    customInstruction: string;
    supportedTypes?: {
        solidColor?: boolean;
        gradient?: boolean;
        image?: boolean;
        pattern?: boolean;
    };
    imageSpecs?: {
        size?: string;
        quality?: string;
        format?: string;
        background?: string;
    };
}
export declare function extractSchemaInstructions(schema: z.ZodType<any>): ExtractedInstruction[];
export declare function formatInstructionsForPrompt(instructions: ExtractedInstruction[]): string;
export declare function extractSupportedTypesMetadata(schema: z.ZodType<any>): Record<string, any>;

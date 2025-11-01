"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSchemaInstructions = extractSchemaInstructions;
exports.formatInstructionsForPrompt = formatInstructionsForPrompt;
exports.extractSupportedTypesMetadata = extractSupportedTypesMetadata;
function extractSchemaInstructions(schema) {
    return extractSchemaInstructionsFromZod(schema);
}
function extractSchemaInstructionsFromZod(schema) {
    const instructions = [];
    if (!schema || !('shape' in schema)) {
        return instructions;
    }
    const shape = schema.shape;
    for (const [fieldName, fieldSchema] of Object.entries(shape)) {
        if (!fieldSchema || typeof fieldSchema !== 'object')
            continue;
        const instruction = extractFieldInstruction(fieldName, fieldSchema);
        if (instruction) {
            instructions.push(instruction);
        }
    }
    return instructions;
}
function extractFieldInstruction(fieldName, fieldSchema) {
    if (!fieldSchema || !('_def' in fieldSchema)) {
        return null;
    }
    const def = fieldSchema._def;
    const refinements = def.refinements || [];
    let customInstruction = '';
    let supportedTypes = undefined;
    let imageSpecs = undefined;
    for (const refinement of refinements) {
        if (refinement.params?.customInstruction) {
            customInstruction = refinement.params.customInstruction;
        }
        if (refinement.params?.supportsSolidColor !== undefined ||
            refinement.params?.supportsGradient !== undefined ||
            refinement.params?.supportsImage !== undefined ||
            refinement.params?.supportsPattern !== undefined) {
            supportedTypes = {
                solidColor: refinement.params.supportsSolidColor,
                gradient: refinement.params.supportsGradient,
                image: refinement.params.supportsImage,
                pattern: refinement.params.supportsPattern,
            };
        }
        if (refinement.params?.size !== undefined ||
            refinement.params?.quality !== undefined ||
            refinement.params?.format !== undefined ||
            refinement.params?.background !== undefined) {
            imageSpecs = {
                size: refinement.params.size,
                quality: refinement.params.quality,
                format: refinement.params.format,
                background: refinement.params.background,
            };
        }
    }
    if (!customInstruction && !supportedTypes && !imageSpecs) {
        return null;
    }
    return {
        fieldName,
        customInstruction,
        supportedTypes,
        imageSpecs,
    };
}
function formatInstructionsForPrompt(instructions) {
    if (instructions.length === 0)
        return '';
    const formatted = instructions
        .map(instruction => {
        let text = `- ${instruction.fieldName}: ${instruction.customInstruction}`;
        if (instruction.supportedTypes) {
            const types = [];
            if (instruction.supportedTypes.image)
                types.push('images');
            if (instruction.supportedTypes.gradient)
                types.push('gradients');
            if (instruction.supportedTypes.solidColor)
                types.push('solid colors');
            if (instruction.supportedTypes.pattern)
                types.push('patterns');
            if (types.length > 0) {
                text += ` (Supports: ${types.join(', ')})`;
            }
        }
        return text;
    })
        .join('\n');
    return `\nField-Specific Instructions:\n${formatted}`;
}
function extractSupportedTypesMetadata(schema) {
    const metadata = {};
    if (!schema || !('shape' in schema)) {
        return metadata;
    }
    const shape = schema.shape;
    for (const [fieldName, fieldSchema] of Object.entries(shape)) {
        if (!fieldSchema || typeof fieldSchema !== 'object')
            continue;
        const fieldMetadata = extractFieldMetadata(fieldName, fieldSchema);
        if (fieldMetadata) {
            metadata[fieldName] = fieldMetadata;
        }
    }
    return metadata;
}
function extractFieldMetadata(fieldName, fieldSchema) {
    if (!fieldSchema || !('_def' in fieldSchema)) {
        return null;
    }
    const def = fieldSchema._def;
    const refinements = def.refinements || [];
    let metadata = {
        type: def.typeName,
        description: def.description,
        default: def.defaultValue?.(),
        optional: def.typeName === 'ZodOptional',
    };
    for (const refinement of refinements) {
        if (refinement.params) {
            if (refinement.params.supportsImage !== undefined) {
                metadata.supportsImage = refinement.params.supportsImage;
            }
            if (refinement.params.supportsGradient !== undefined) {
                metadata.supportsGradient = refinement.params.supportsGradient;
            }
            if (refinement.params.supportsSolidColor !== undefined) {
                metadata.supportsSolidColor = refinement.params.supportsSolidColor;
            }
            if (refinement.params.supportsPattern !== undefined) {
                metadata.supportsPattern = refinement.params.supportsPattern;
            }
            if (refinement.params.customInstruction) {
                metadata.customInstruction = refinement.params.customInstruction;
            }
        }
    }
    return metadata;
}
//# sourceMappingURL=schemaInstructionExtractor.js.map
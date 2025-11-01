import { type z } from 'zod'

export interface ExtractedInstruction {
  fieldName: string
  customInstruction: string
  supportedTypes?: {
    solidColor?: boolean
    gradient?: boolean
    image?: boolean
    pattern?: boolean
  }
  imageSpecs?: {
    size?: string
    quality?: string
    format?: string
    background?: string
  }
}

/**
 * Extract custom instructions from Zod schema refinements
 */
export function extractSchemaInstructions(schema: z.ZodType<any>): ExtractedInstruction[] {
  return extractSchemaInstructionsFromZod(schema)
}

/**
 * Extract custom instructions from a Zod schema's refinements
 */
function extractSchemaInstructionsFromZod(schema: z.ZodType<any>): ExtractedInstruction[] {
  const instructions: ExtractedInstruction[] = []

  if (!schema || !('shape' in schema)) {
    return instructions
  }

  const shape = (schema as any).shape

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    if (!fieldSchema || typeof fieldSchema !== 'object') continue

    const instruction = extractFieldInstruction(fieldName, fieldSchema as z.ZodType<any>)
    if (instruction) {
      instructions.push(instruction)
    }
  }

  return instructions
}

/**
 * Extract instruction from a single field schema
 */
function extractFieldInstruction(
  fieldName: string,
  fieldSchema: z.ZodType<any>
): ExtractedInstruction | null {
  if (!fieldSchema || !('_def' in fieldSchema)) {
    return null
  }

  const def = (fieldSchema as any)._def
  const refinements = def.refinements || []

  let customInstruction = ''
  let supportedTypes = undefined
  let imageSpecs = undefined

  for (const refinement of refinements) {
    if (refinement.params?.customInstruction) {
      customInstruction = refinement.params.customInstruction
    }

    // Extract supported types if present
    if (
      refinement.params?.supportsSolidColor !== undefined ||
      refinement.params?.supportsGradient !== undefined ||
      refinement.params?.supportsImage !== undefined ||
      refinement.params?.supportsPattern !== undefined
    ) {
      supportedTypes = {
        solidColor: refinement.params.supportsSolidColor,
        gradient: refinement.params.supportsGradient,
        image: refinement.params.supportsImage,
        pattern: refinement.params.supportsPattern,
      }
    }

    // Extract image specifications if present
    if (
      refinement.params?.size !== undefined ||
      refinement.params?.quality !== undefined ||
      refinement.params?.format !== undefined ||
      refinement.params?.background !== undefined
    ) {
      imageSpecs = {
        size: refinement.params.size,
        quality: refinement.params.quality,
        format: refinement.params.format,
        background: refinement.params.background,
      }
    }
  }

  if (!customInstruction && !supportedTypes && !imageSpecs) {
    return null
  }

  return {
    fieldName,
    customInstruction,
    supportedTypes,
    imageSpecs,
  }
}

/**
 * Format instructions for prompt inclusion
 */
export function formatInstructionsForPrompt(instructions: ExtractedInstruction[]): string {
  if (instructions.length === 0) return ''

  const formatted = instructions
    .map(instruction => {
      let text = `- ${instruction.fieldName}: ${instruction.customInstruction}`
      
      if (instruction.supportedTypes) {
        const types = []
        if (instruction.supportedTypes.image) types.push('images')
        if (instruction.supportedTypes.gradient) types.push('gradients')
        if (instruction.supportedTypes.solidColor) types.push('solid colors')
        if (instruction.supportedTypes.pattern) types.push('patterns')
        
        if (types.length > 0) {
          text += ` (Supports: ${types.join(', ')})`
        }
      }
      
      return text
    })
    .join('\n')

  return `\nField-Specific Instructions:\n${formatted}`
}

/**
 * Extract supported types metadata for each field
 */
export function extractSupportedTypesMetadata(schema: z.ZodType<any>): Record<string, any> {
  const metadata: Record<string, any> = {}

  if (!schema || !('shape' in schema)) {
    return metadata
  }

  const shape = (schema as any).shape

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    if (!fieldSchema || typeof fieldSchema !== 'object') continue

    const fieldMetadata = extractFieldMetadata(fieldName, fieldSchema as z.ZodType<any>)
    if (fieldMetadata) {
      metadata[fieldName] = fieldMetadata
    }
  }

  return metadata
}

/**
 * Extract metadata from a single field
 */
function extractFieldMetadata(
  fieldName: string,
  fieldSchema: z.ZodType<any>
): any {
  if (!fieldSchema || !('_def' in fieldSchema)) {
    return null
  }

  const def = (fieldSchema as any)._def
  const refinements = def.refinements || []

  let metadata: any = {
    type: def.typeName,
    description: def.description,
    default: def.defaultValue?.(),
    optional: def.typeName === 'ZodOptional',
  }

  // Extract support type information
  for (const refinement of refinements) {
    if (refinement.params) {
      if (refinement.params.supportsImage !== undefined) {
        metadata.supportsImage = refinement.params.supportsImage
      }
      if (refinement.params.supportsGradient !== undefined) {
        metadata.supportsGradient = refinement.params.supportsGradient
      }
      if (refinement.params.supportsSolidColor !== undefined) {
        metadata.supportsSolidColor = refinement.params.supportsSolidColor
      }
      if (refinement.params.supportsPattern !== undefined) {
        metadata.supportsPattern = refinement.params.supportsPattern
      }
      if (refinement.params.customInstruction) {
        metadata.customInstruction = refinement.params.customInstruction
      }
    }
  }

  return metadata
}

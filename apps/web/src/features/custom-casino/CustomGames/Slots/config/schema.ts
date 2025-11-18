// @ts-nocheck
import { z } from 'zod'
import { type SlotsParameters, DEFAULT_SLOTS_PARAMETERS } from '../types'

// Color field metadata to inform the LLM about supported features
const flexibleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsLinearGradient: true,
  supportsRadialGradient: true,
  supportsImage: true,
  preferredType: 'image',
} as const

const gradientColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsLinearGradient: true,
  supportsRadialGradient: true,
  supportsImage: false,
} as const

const simpleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: false,
  supportsImage: false,
} as const

export const SlotsParamsSchema = z.object({
  // Visual parameters - Colors
  background: z
    .object({
      url: z.string().describe('Background URL or color value'),
    })
    .describe(
      'Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches a casino or slots theme.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  reelBackground: z
    .string()
    .describe(
      'Background inside each reel. Supports solid colors, linear gradients, radial gradients, and alpha transparency.'
    )
    .refine(() => true, { params: gradientColorFieldMetadata }),

  reelContainer: z
    .string()
    .describe(
      'Background of the container holding all reels. Supports solid colors, linear gradients, radial gradients, and alpha transparency.'
    )
    .refine(() => true, { params: gradientColorFieldMetadata }),

  borderColor: z
    .string()
    .describe('Border color for container and reels. Solid color with alpha support.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  paylineIndicator: z
    .string()
    .describe('Color of the center payline indicator. Solid color with alpha support.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  winColor: z
    .string()
    .describe('Color for win indicators and effects. Solid color with alpha support.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  // Slot symbols - exactly 7 for the progressive tier system
  slotsSymbols: z
    .array(z.string())
    .length(7)
    .describe('Array of exactly 7 symbol images or emojis (lowest to highest tier)'),
})

/**
 * Validate slots parameters
 */
export function validateSlotsParameters(params: unknown): params is SlotsParameters {
  try {
    SlotsParamsSchema.parse(params)
    return true
  } catch {
    return false
  }
}

/**
 * Load and validate slots parameters with defaults
 */
export function loadSlotsParameters(params: Partial<SlotsParameters>): SlotsParameters {
  // Merge with defaults, handling nested properties properly
  const merged = {
    ...DEFAULT_SLOTS_PARAMETERS,
    ...params,
    // Ensure slotsSymbols is properly handled
    slotsSymbols:
      params.slotsSymbols && params.slotsSymbols.length === 7 ?
        params.slotsSymbols
      : DEFAULT_SLOTS_PARAMETERS.slotsSymbols,
  }

  // Validate
  const result = SlotsParamsSchema.safeParse(merged)

  if (result.success) {
    return result.data as SlotsParameters
  }

  // Fall back to defaults if validation fails
  console.warn('Invalid slots parameters, using defaults:', result.error)
  return DEFAULT_SLOTS_PARAMETERS
}

/**
 * Get default slots parameters
 */
export function getDefaultSlotsParameters(): SlotsParameters {
  return { ...DEFAULT_SLOTS_PARAMETERS }
}

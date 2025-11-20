// @ts-nocheck
import { z } from 'zod'
import { PLINKO_CONSTRAINTS, type PlinkoParameters, DEFAULT_PLINKO_PARAMETERS } from '../types'
import { SoundData } from '@/features/custom-casino/shared/types/sound.types'
import { type IConfig } from '@/features/custom-casino/config/IConfig'

// Color field metadata to inform the LLM about supported features
const flexibleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsImage: true,
  preferredType: 'image', // Hint to the LLM to prefer generating image prompts
} as const

const simpleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: false,
  supportsImage: false,
} as const

const radialGradientColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsRadialGradient: true,
  supportsLinearGradient: false,
  supportsImage: false,
} as const

const outlineColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: false,
  supportsImage: false,
  supportsAlpha: true,
} as const

export const PlinkoParamsSchema = z
  .object({
    // Core gameplay parameters
    ballCount: z
      .number()
      .min(PLINKO_CONSTRAINTS.ballCount.min)
      .max(PLINKO_CONSTRAINTS.ballCount.max)
      .describe('Number of balls to drop (1-20)'),

    rowCount: z
      .number()
      .min(PLINKO_CONSTRAINTS.rowCount.min)
      .max(PLINKO_CONSTRAINTS.rowCount.max)
      .describe('Number of peg rows (8-16)'),

    riskLevel: z
      .number()
      .min(PLINKO_CONSTRAINTS.riskLevel.min)
      .max(PLINKO_CONSTRAINTS.riskLevel.max)
      .describe('Risk level: 0=Low, 1=Medium, 2=High'),

    // Visual parameters
    background: z
      .string()
      .describe(
        'Game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches a Plinko theme.'
      )
      .refine(() => true, { params: flexibleColorFieldMetadata }),

    ballColor: z
      .string()
      .describe('Ball color. Solid color only for consistent animation performance.')
      .refine(() => true, { params: simpleColorFieldMetadata }),

    pegColor: z
      .string()
      .describe('Peg color. Solid color only for consistent rendering.')
      .refine(() => true, { params: simpleColorFieldMetadata }),

    bucketColor: z
      .string()
      .describe(
        'Bucket background color or texture. Supports gradient and images. 4:1 aspect ratio. Prefer generating an image prompt for a themed bucket texture.'
      )
      .refine(() => true, { params: flexibleColorFieldMetadata }),

    bucketOutlineColor: z
      .string()
      .describe(
        'Bucket outline color that appears when a ball hits a bucket. Supports solid colors with alpha transparency.'
      )
      .refine(() => true, { params: outlineColorFieldMetadata }),

    multiplierColor: z
      .string()
      .describe(
        'Multiplier text color. Supports solid colors and radial gradients. Radial gradients apply from center outward across all multipliers.'
      )
      .refine(() => true, { params: radialGradientColorFieldMetadata }),

    ballTrail: z.boolean().describe('Enable/disable ball trail effects during animation'),

    ballDropDelay: z
      .number()
      .min(PLINKO_CONSTRAINTS.ballDropDelay.min)
      .max(PLINKO_CONSTRAINTS.ballDropDelay.max)
      .describe('Time in milliseconds between ball drops during multi-ball gameplay'),

    showBucketAnimations: z
      .boolean()
      .describe('Enable/disable bouncing animations when balls hit buckets'),

    gameSize: z
      .number()
      .min(PLINKO_CONSTRAINTS.gameSize.min)
      .max(PLINKO_CONSTRAINTS.gameSize.max)
      .describe('Game size relative to container'),

    // Custom sound effects
    customSounds: z.object({
      ballDrop: z.custom<SoundData>().optional()
        .describe('Custom sound for ball drop events'),
      bucketLanding: z.custom<SoundData>().optional()
        .describe('Custom sound for when balls land in buckets'),
    }).optional()
      .describe('Custom sound effects for the game'),
  })
  .passthrough()

/**
 * Validates plinko game parameters
 * Replaces PlinkoConfig.validate() functionality
 */
export const validatePlinkoParameters = (data: any): boolean => {
  try {
    PlinkoParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates plinko parameters with defaults
 * Replaces PlinkoConfig.load() functionality
 */
export const loadPlinkoParameters = (data: any): PlinkoParameters => {
  const merged = {
    ...DEFAULT_PLINKO_PARAMETERS,
    ...data,
  }

  // Validate the merged data
  const result = PlinkoParamsSchema.safeParse(merged)
  if (!result.success) {
    console.warn('Invalid plinko parameters, using defaults:', result.error)
    return DEFAULT_PLINKO_PARAMETERS
  }

  return merged
}

/**
 * Gets default plinko parameters
 * Replaces PlinkoConfig.getDefaultParameters() functionality
 */
export const getDefaultPlinkoParameters = (): PlinkoParameters => {
  return DEFAULT_PLINKO_PARAMETERS
}

/**
 * Schema-based config class for Plinko game
 * Replaces PlinkoConfig with Zod-based validation
 */
export class PlinkoSchemaConfig implements IConfig {
  private parameters: PlinkoParameters = DEFAULT_PLINKO_PARAMETERS

  load(data: any): void {
    this.parameters = loadPlinkoParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validatePlinkoParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): PlinkoParameters {
    return getDefaultPlinkoParameters()
  }
}

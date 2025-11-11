// @ts-nocheck
import { z } from 'zod'
import { COINFLIP_CONSTRAINTS, type CoinFlipParameters, DEFAULT_COINFLIP_PARAMETERS } from './types'
import { type IConfig } from '@/components/CustomUserCasinos/config/IConfig'
import { type SoundData } from '../../shared/types/sound.types'

// Color field metadata to inform the LLM about supported features
const flexibleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsImage: true,
  preferredType: 'image',
} as const

const simpleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: false,
  supportsImage: false,
} as const

export const CoinFlipParamsSchema = z.object({
  // Visual parameters
  background: z
    .object({
      url: z.string().describe('Background URL or color value'),
    })
    .describe(
      'Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  coinColor: z
    .string()
    .describe(
      'Main color/texture of the coin. Supports gradient and images. Prefer generating an image prompt for a themed coin texture.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  // Custom images for heads and tails
  headsCustomImage: z
    .string()
    .describe('Custom image URL for heads side. Required field for coin face customization.'),

  tailsCustomImage: z
    .string()
    .describe('Custom image URL for tails side. Required field for coin face customization.'),

  textColor: z
    .string()
    .describe('Color of text on the coin and UI elements. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  coinSize: z
    .number()
    .min(COINFLIP_CONSTRAINTS.coinSize.min)
    .max(COINFLIP_CONSTRAINTS.coinSize.max)
    .describe('Relative size of the coin'),

  animationSpeed: z
    .number()
    .min(COINFLIP_CONSTRAINTS.animationDuration.min)
    .max(COINFLIP_CONSTRAINTS.animationDuration.max)
    .describe('Speed of coin flip animation in milliseconds'),

  flipCount: z
    .number()
    .min(COINFLIP_CONSTRAINTS.flipCount.min)
    .max(COINFLIP_CONSTRAINTS.flipCount.max)
    .describe('Number of flips in the animation'),

  particleCount: z
    .number()
    .min(COINFLIP_CONSTRAINTS.particleCount.min)
    .max(COINFLIP_CONSTRAINTS.particleCount.max)
    .describe('Number of particles emitted on win'),

  animationPreset: z
    .enum(['flip', 'spin', 'twist'])
    .describe('Type of animation preset to use for the coin flip'),

  coinModel: z
    .enum(['wireframe', 'solid', 'neon', 'custom'])
    .describe('Visual style of the coin model'),

  // State colors (simple colors only)
  winColor: z
    .string()
    .describe('Color used for winning outcome visual feedback. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  lossColor: z
    .string()
    .describe('Color used for losing outcome visual feedback. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  borderColor: z
    .string()
    .describe('Color of coin border and UI elements. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  // Effect settings
  particleEffects: z
    .enum(['none', 'less', 'more'])
    .describe('Level of particle effects during coin flip'),

  glowEffect: z.boolean().describe('Whether to show glow effect around the coin'),

  // Custom sound effects
  customSounds: z
    .object({
      coinFlip: z.custom<SoundData>().optional().describe('Custom sound for coin flip'),
      gameWin: z.custom<SoundData>().optional().describe('Custom sound for winning'),
      gameLoss: z.custom<SoundData>().optional().describe('Custom sound for losing'),
    })
    .optional()
    .describe('Custom sound effects for the coinflip game'),
})

/**
 * Validates coin flip game parameters
 * Replaces CoinFlipConfig.validate() functionality
 */
export const validateCoinFlipParameters = (data: any): boolean => {
  try {
    CoinFlipParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates coin flip parameters with defaults
 * Replaces CoinFlipConfig.load() functionality
 */
export const loadCoinFlipParameters = (data: any): CoinFlipParameters => {
  const merged = {
    ...DEFAULT_COINFLIP_PARAMETERS,
    ...data,
  }

  // Validate the merged data
  const result = CoinFlipParamsSchema.safeParse(merged)
  if (!result.success) {
    return DEFAULT_COINFLIP_PARAMETERS
  }

  // Ensure we return the complete CoinFlipParameters with base fields
  return {
    ...DEFAULT_COINFLIP_PARAMETERS,
    ...result.data,
    // Ensure background is properly formatted as ImageData
    background:
      typeof result.data.background === 'string' ?
        { url: result.data.background }
      : result.data.background,
  }
}

/**
 * Gets default coin flip parameters
 * Replaces CoinFlipConfig.getDefaultParameters() functionality
 */
export const getDefaultCoinFlipParameters = (): CoinFlipParameters => {
  return DEFAULT_COINFLIP_PARAMETERS
}

/**
 * Schema-based config class for CoinFlip game
 * Replaces CoinFlipConfig with Zod-based validation
 */
export class CoinFlipSchemaConfig implements IConfig {
  private parameters: CoinFlipParameters = DEFAULT_COINFLIP_PARAMETERS

  load(data: any): void {
    this.parameters = loadCoinFlipParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateCoinFlipParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): CoinFlipParameters {
    return getDefaultCoinFlipParameters()
  }
}

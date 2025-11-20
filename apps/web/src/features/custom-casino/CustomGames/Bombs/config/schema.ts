// @ts-nocheck
import { z } from 'zod'
import { BOMBS_CONSTRAINTS, type BombsParameters, DEFAULT_BOMBS_PARAMETERS } from '../types'
import { type IConfig } from '@/features/custom-casino/config/IConfig'
import { type SoundData } from '@/features/custom-casino/shared/types/sound.types'

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

export const BombsParamsSchema = z.object({
  // Visual parameters
  background: z
    .string()
    .describe(
      'Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),
  tileColor: z
    .string()
    .describe(
      'Default tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed tile texture.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),
  selectedTileColor: z
    .string()
    .describe(
      'Selected tile appearance. Supports gradient and images. Prefer generating an image prompt for a highlighted tile texture.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),
  bombColor: z
    .string()
    .describe(
      'Bomb tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed bomb design.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),
  safeColor: z
    .string()
    .describe(
      'Safe tile appearance. Supports gradient and images. Prefer generating an image prompt for a themed safe tile design.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  // Shape and layout options
  tileShape: z.enum(['square', 'round']).describe('Shape of the game tiles'),
  tileSize: z
    .number()
    .min(BOMBS_CONSTRAINTS.tileSize.min)
    .max(BOMBS_CONSTRAINTS.tileSize.max)
    .describe('Size of each tile in pixels'),
  tileSpacing: z
    .number()
    .min(BOMBS_CONSTRAINTS.tileSpacing.min)
    .max(BOMBS_CONSTRAINTS.tileSpacing.max)
    .describe('Space between tiles in pixels'),

  // Border colors (simple colors only)
  borderColor: z
    .string()
    .describe('Default tile border color. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),
  selectedBorderColor: z
    .string()
    .describe('Selected tile border color. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),
  winColor: z
    .string()
    .describe('Border color for winning state. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),
  lossColor: z
    .string()
    .describe('Border color for losing state. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  // Effects
  particleEffects: z
    .enum(['none', 'less', 'more'])
    .describe('Level of particle effects when revealing tiles'),

  // Custom sound effects
  customSounds: z
    .object({
      tileClick: z.custom<SoundData>().optional().describe('Custom sound for tile clicks'),
      coinReveal: z.custom<SoundData>().optional().describe('Custom sound for coin reveals'),
      bombExplosion: z.custom<SoundData>().optional().describe('Custom sound for bomb explosions'),
      gameWin: z.custom<SoundData>().optional().describe('Custom sound for winning'),
      gameLoss: z.custom<SoundData>().optional().describe('Custom sound for losing'),
    })
    .optional()
    .describe('Custom sound effects for the bombs game'),
})

/**
 * Validates bombs game parameters
 * Replaces BombsConfig.validate() functionality
 */
export const validateBombsParameters = (data: any): boolean => {
  try {
    BombsParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates bombs parameters with defaults
 * Replaces BombsConfig.load() functionality
 */
export const loadBombsParameters = (data: any): BombsParameters => {
  const merged = {
    ...DEFAULT_BOMBS_PARAMETERS,
    ...data,
  }

  // Validate the merged data
  const result = BombsParamsSchema.safeParse(merged)
  if (!result.success) {
    console.warn('Invalid bombs parameters, using defaults:', result.error)
    return DEFAULT_BOMBS_PARAMETERS
  }

  return merged
}

/**
 * Gets default bombs parameters
 * Replaces BombsConfig.getDefaultParameters() functionality
 */
export const getDefaultBombsParameters = (): BombsParameters => {
  return DEFAULT_BOMBS_PARAMETERS
}

/**
 * Schema-based config class for Bombs game
 * Replaces BombsConfig with Zod-based validation
 */
export class BombsSchemaConfig implements IConfig {
  private parameters: BombsParameters = DEFAULT_BOMBS_PARAMETERS

  load(data: any): void {
    this.parameters = loadBombsParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateBombsParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): BombsParameters {
    return getDefaultBombsParameters()
  }
}

// @ts-nocheck
import { z } from 'zod'
import { DICE_CONSTRAINTS, type DiceParameters, DEFAULT_DICE_PARAMETERS } from './types'
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

export const DiceParamsSchema = z.object({
  // Visual parameters
  background: z
    .string()
    .describe(
      'Main game background. Supports gradient, alpha, and images. Prefer generating an image prompt that matches the theme.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  diceColor: z
    .string()
    .describe('Main color of the dice (for non-custom models). Solid colors only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  diceImage: z
    .string()
    .describe(
      'Custom dice texture/image (for custom model). Supports images only. Prefer generating an image prompt for a themed dice texture.'
    )
    .optional()
    .refine(() => true, {
      params: {
        supportsSolidColor: false,
        supportsGradient: false,
        supportsImage: true,
        preferredType: 'image',
      },
    }),

  textColor: z
    .string()
    .describe('Color of text on the dice and UI elements. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  diceSize: z
    .number()
    .min(DICE_CONSTRAINTS.diceSize.min)
    .max(DICE_CONSTRAINTS.diceSize.max)
    .describe('Size of the dice in pixels'),

  animationSpeed: z
    .number()
    .min(DICE_CONSTRAINTS.animationSpeed.min)
    .max(DICE_CONSTRAINTS.animationSpeed.max)
    .describe('Speed of dice animation in milliseconds'),

  // State colors (simple colors only)
  winColor: z
    .string()
    .describe('Color used for winning outcome visual feedback. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  loseColor: z
    .string()
    .describe('Color used for losing outcome visual feedback. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  // Animation and model settings
  animationPreset: z
    .enum(['simple', 'thump', 'spin'])
    .describe('Predefined animation style for the dice roll'),

  diceModel: z
    .enum(['wireframe', 'solid', 'neon', 'custom'])
    .describe(
      'Visual style of the dice model. If you are using an image for the dice color, set this to custom. Wireframe is a simple flat dice, solid is a modern dice with shadowy gradients, and neon is a futuristic neon outline.'
    ),

  // Custom sound effects
  customSounds: z
    .object({
      rollStart: z.custom<SoundData>().optional().describe('Custom sound for dice roll start'),
      diceWin: z.custom<SoundData>().optional().describe('Custom sound for winning result'),
      diceLoss: z.custom<SoundData>().optional().describe('Custom sound for losing result'),
    })
    .optional()
    .describe('Custom sound effects for the dice game'),
})

/**
 * Validates dice game parameters
 * Replaces DiceConfig.validate() functionality
 */
export const validateDiceParameters = (data: any): boolean => {
  try {
    DiceParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates dice parameters with defaults
 * Replaces DiceConfig.load() functionality
 */
export const loadDiceParameters = (data: any): DiceParameters => {
  const merged = {
    ...DEFAULT_DICE_PARAMETERS,
    ...data,
  }

  // Validate the merged data
  const result = DiceParamsSchema.safeParse(merged)
  if (!result.success) {
    console.warn('Invalid dice parameters, using defaults:', result.error)
    return DEFAULT_DICE_PARAMETERS
  }

  return merged
}

/**
 * Gets default dice parameters
 * Replaces DiceConfig.getDefaultParameters() functionality
 */
export const getDefaultDiceParameters = (): DiceParameters => {
  return DEFAULT_DICE_PARAMETERS
}

/**
 * Schema-based config class for Dice game
 * Replaces DiceConfig with Zod-based validation
 */
export class DiceSchemaConfig implements IConfig {
  private parameters: DiceParameters = DEFAULT_DICE_PARAMETERS

  load(data: any): void {
    this.parameters = loadDiceParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateDiceParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): DiceParameters {
    return getDefaultDiceParameters()
  }
}

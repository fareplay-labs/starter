// @ts-nocheck
import { z } from 'zod'
import { ROULETTE_CONSTRAINTS, type RouletteParameters, DEFAULT_ROULETTE_PARAMETERS } from './types'
import { SoundData } from '@/features/custom-casino/shared/types/sound.types'
import { type IConfig } from '@/features/custom-casino/config/IConfig'

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

export const RouletteParamsSchema = z.object({
  minBetAmount: z
    .number()
    .min(ROULETTE_CONSTRAINTS.minBetAmount.min)
    .max(ROULETTE_CONSTRAINTS.minBetAmount.max)
    .describe('Minimum bet amount allowed'),

  maxBetAmount: z
    .number()
    .min(ROULETTE_CONSTRAINTS.maxBetAmount.min)
    .max(ROULETTE_CONSTRAINTS.maxBetAmount.max)
    .describe('Maximum bet amount allowed'),

  layoutType: z
    .enum(['spin', 'scroll', 'tiles'])
    .describe(
      'Main layout type: spin (traditional wheel), scroll (slot machine style), tiles (grid with glow effects)'
    ),

  textColor: z
    .string()
    .describe('Color of text on tiles and UI elements. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  rouletteColor1: z
    .string()
    .describe('Color for red numbers on the roulette wheel. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  rouletteColor2: z
    .string()
    .describe('Color for black numbers on the roulette wheel. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  neutralColor: z
    .string()
    .describe('Color for the 0 tile (traditionally green). Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  spinDuration: z
    .number()
    .min(ROULETTE_CONSTRAINTS.spinDuration.min)
    .max(ROULETTE_CONSTRAINTS.spinDuration.max)
    .describe('Duration of the main game animation in milliseconds'),

  resetDuration: z
    .number()
    .min(ROULETTE_CONSTRAINTS.resetDuration.min)
    .max(ROULETTE_CONSTRAINTS.resetDuration.max)
    .describe('Duration for game to reset to starting position in milliseconds'),

  wheelRadius: z
    .number()
    .min(ROULETTE_CONSTRAINTS.wheelRadius.min)
    .max(ROULETTE_CONSTRAINTS.wheelRadius.max)
    .optional()
    .describe('Size of the roulette wheel in pixels (only for spin layout)'),

  wheelAccentColor: z
    .string()
    .optional()
    .describe('Color for wheel borders and accent elements (only for spin layout)')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  wheelBackground: z
    .string()
    .optional()
    .describe(
      'Background inside the wheel area - supports images, gradients, etc. (only for spin layout)'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  scrollSpeed: z
    .number()
    .min(ROULETTE_CONSTRAINTS.scrollSpeed.min)
    .max(ROULETTE_CONSTRAINTS.scrollSpeed.max)
    .optional()
    .describe('Initial velocity of the scrolling animation (only for scroll layout)'),

  decelerationRate: z
    .number()
    .min(ROULETTE_CONSTRAINTS.decelerationRate.min)
    .max(ROULETTE_CONSTRAINTS.decelerationRate.max)
    .optional()
    .describe('How quickly the scroll slows down (only for scroll layout)'),

  neighborOpacity: z
    .number()
    .min(ROULETTE_CONSTRAINTS.neighborOpacity.min)
    .max(ROULETTE_CONSTRAINTS.neighborOpacity.max)
    .optional()
    .describe('Opacity of numbers adjacent to the active one (only for scroll layout)'),

  visibleNeighbors: z
    .number()
    .min(ROULETTE_CONSTRAINTS.visibleNeighbors.min)
    .max(ROULETTE_CONSTRAINTS.visibleNeighbors.max)
    .optional()
    .describe(
      'How many numbers to show on each side of the active number (only for scroll layout)'
    ),

  numberSize: z
    .number()
    .min(ROULETTE_CONSTRAINTS.numberSize.min)
    .max(ROULETTE_CONSTRAINTS.numberSize.max)
    .optional()
    .describe('Size of the displayed numbers in pixels (only for scroll layout)'),

  tileSize: z
    .number()
    .min(ROULETTE_CONSTRAINTS.tileSize.min)
    .max(ROULETTE_CONSTRAINTS.tileSize.max)
    .optional()
    .describe('Size of individual tiles in pixels (only for tiles layout)'),

  tileSpacing: z
    .number()
    .min(ROULETTE_CONSTRAINTS.tileSpacing.min)
    .max(ROULETTE_CONSTRAINTS.tileSpacing.max)
    .optional()
    .describe('Gap between tiles in pixels (only for tiles layout)'),

  tileBorderRadius: z
    .number()
    .min(ROULETTE_CONSTRAINTS.tileBorderRadius.min)
    .max(ROULETTE_CONSTRAINTS.tileBorderRadius.max)
    .optional()
    .describe('Corner rounding for tiles (only for tiles layout)'),

  tileBorderHighlightColor: z
    .string()
    .optional()
    .describe('Color for active tile borders during animation (only for tiles layout)')
    .refine(() => true, { params: simpleColorFieldMetadata }),


  animationPattern: z
    .enum(['sequential', 'random', 'waterfall'])
    .optional()
    .describe('Pattern for tile illumination during gameplay (only for tiles layout)'),

  layoutStyle: z
    .enum(['circular', 'grid', 'spiral', 'linear'])
    .optional()
    .describe('Legacy layout style parameter - use spinLayoutStyle instead'),

  background: z
    .string()
    .optional()
    .describe('Game background. Supports gradient, alpha, and images.')
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  tileColor: z
    .string()
    .optional()
    .describe('Legacy tile color - computed from layout colors')
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  tileHoverColor: z
    .string()
    .optional()
    .describe('Legacy tile hover color - computed from layout colors')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  winningTileColor: z
    .string()
    .optional()
    .describe('Legacy winning tile color - computed from layout colors')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  accentColor: z
    .string()
    .optional()
    .describe('Legacy accent color - use rouletteColor1 instead')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  winAnimationDuration: z
    .number()
    .min(ROULETTE_CONSTRAINTS.winAnimationDuration.min)
    .max(ROULETTE_CONSTRAINTS.winAnimationDuration.max)
    .optional()
    .describe('Legacy win animation duration - use resetDuration instead'),

  chipColors: z
    .array(z.string())
    .min(3)
    .max(10)
    .describe('Colors for different chip denominations. Array of solid colors.'),

  showBettingHistory: z.boolean().describe('Whether to show recent betting history'),

  enableQuickBets: z.boolean().describe('Whether to enable quick bet buttons for common bets'),

  theme: z
    .enum(['classic', 'neon', 'minimal', 'casino', 'futuristic', 'custom'])
    .describe('Predefined visual theme. Use custom for AI-generated themes.'),

  customCSS: z.string().describe('Custom CSS for advanced styling and theming'),

  // Custom sound effects
  customSounds: z.object({
    spinStart: z.custom<SoundData>().optional()
      .describe('Custom sound for when spin begins'),
    spinResult: z.custom<SoundData>().optional()
      .describe('Custom sound for spin result (win/loss)'),
    spinReset: z.custom<SoundData>().optional()
      .describe('Custom sound for when game resets to idle'),
    tileHighlight: z.custom<SoundData>().optional()
      .describe('Custom sound for tile highlight during animation'),
    tilesResult: z.custom<SoundData>().optional()
      .describe('Custom sound for tiles result (win/loss)'),
  }).optional()
    .describe('Custom sound effects for the game'),
})

/**
 * Validates roulette game parameters
 * Replaces RouletteConfig.validate() functionality
 */
export const validateRouletteParameters = (data: any): boolean => {
  try {
    RouletteParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates roulette parameters with defaults
 * Handles backward compatibility and parameter migration
 */
export const loadRouletteParameters = (data: any): RouletteParameters => {
  const merged = {
    ...DEFAULT_ROULETTE_PARAMETERS,
    ...data,
  }

  if (merged.layoutStyle && !merged.spinLayoutStyle) {
    merged.spinLayoutStyle = merged.layoutStyle
  }

  if (merged.winAnimationDuration && !merged.resetDuration) {
    merged.resetDuration = merged.winAnimationDuration
  }

  if (!merged.layoutType) {
    merged.layoutType = 'spin'
  }

  const result = RouletteParamsSchema.safeParse(merged)
  if (!result.success) {
    console.warn('Invalid roulette parameters, using defaults:', result.error)
    return DEFAULT_ROULETTE_PARAMETERS
  }

  return merged
}

/**
 * Gets default roulette parameters
 * Replaces RouletteConfig.getDefaultParameters() functionality
 */
export const getDefaultRouletteParameters = (): RouletteParameters => {
  return DEFAULT_ROULETTE_PARAMETERS
}

/**
 * Schema-based config class for Roulette game
 * Replaces RouletteConfig with Zod-based validation
 */
export class RouletteSchemaConfig implements IConfig {
  private parameters: RouletteParameters = DEFAULT_ROULETTE_PARAMETERS

  load(data: any): void {
    this.parameters = loadRouletteParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateRouletteParameters(this.parameters)
  }

  apply(): void { }

  getDefaultParameters(): RouletteParameters {
    return getDefaultRouletteParameters()
  }
}

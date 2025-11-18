// @ts-nocheck
import { z } from 'zod'
import { CRASH_CONSTRAINTS, type CrashParameters, DEFAULT_CRASH_PARAMETERS } from './types'
import { type IConfig } from '@/features/custom-casino/config/IConfig'
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

export const CrashParamsSchema = z.object({
  // Visual parameters
  background: z
    .string()
    .describe(
      'Background color of the crash graph area. Supports gradient, alpha, and images. Prefer dark themes for better contrast.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  lineColor: z
    .string()
    .describe(
      'Color of the rising crash line. Supports gradient and images. Bright colors work best for visibility.'
    )
    .refine(() => true, { params: flexibleColorFieldMetadata }),

  gridColor: z
    .string()
    .describe('Color of the grid lines on the graph. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  gridTextColor: z
    .string()
    .describe('Color of grid labels and text. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  textColor: z
    .string()
    .describe('Color of text elements and multiplier display. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  crashColor: z
    .string()
    .describe('Color used when the crash occurs. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  winColor: z
    .string()
    .describe('Color used for successful cash out visual feedback. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  axesColor: z
    .string()
    .describe('Color of the main axes lines. Solid color only.')
    .refine(() => true, { params: simpleColorFieldMetadata }),

  // Game and display settings
  gameSpeed: z
    .number()
    .min(CRASH_CONSTRAINTS.gameSpeed.min)
    .max(CRASH_CONSTRAINTS.gameSpeed.max)
    .describe('Speed of the game (higher = faster/shorter duration)'),

  showGridlines: z.boolean().describe('Whether to show grid lines on the graph'),

  showGridLabels: z.boolean().describe('Whether to show labels on grid lines'),

  showAxes: z.boolean().describe('Whether to show main axes lines'),

  showTargetLine: z.boolean().describe('Whether to show the target cash out line'),

  lineThickness: z
    .number()
    .min(CRASH_CONSTRAINTS.lineThickness.min)
    .max(CRASH_CONSTRAINTS.lineThickness.max)
    .describe('Thickness of the crash line in pixels'),

  graphSize: z
    .number()
    .min(CRASH_CONSTRAINTS.graphSize.min)
    .max(CRASH_CONSTRAINTS.graphSize.max)
    .describe(
      'Relative size of the graph (scale factor). Controls how much of the container the graph fills.'
    ),

  // Custom sound effects
  customSounds: z
    .object({
      rocketLaunch: z.custom<SoundData>().optional().describe('Custom sound for rocket launch'),
      cashOut: z.custom<SoundData>().optional().describe('Custom sound for successful cash out'),
      crashExplosion: z.custom<SoundData>().optional().describe('Custom sound for crash explosion'),
    })
    .optional()
    .describe('Custom sound effects for the crash game'),
})

/**
 * Validates crash game parameters
 * Replaces CrashConfig.validate() functionality
 */
export const validateCrashParameters = (data: any): boolean => {
  try {
    CrashParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Loads and validates crash parameters with defaults
 * Replaces CrashConfig.load() functionality
 */
export const loadCrashParameters = (data: any): CrashParameters => {
  const merged = {
    ...DEFAULT_CRASH_PARAMETERS,
    ...data,
  }

  // Validate the merged data
  const result = CrashParamsSchema.safeParse(merged)
  if (!result.success) {
    console.warn('Invalid crash parameters, using defaults:', result.error)
    return DEFAULT_CRASH_PARAMETERS
  }

  return merged
}

/**
 * Gets default crash parameters
 * Replaces CrashConfig.getDefaultParameters() functionality
 */
export const getDefaultCrashParameters = (): CrashParameters => {
  return DEFAULT_CRASH_PARAMETERS
}

/**
 * Schema-based config class for Crash game
 * Replaces CrashConfig with Zod-based validation
 */
export class CrashSchemaConfig implements IConfig {
  private parameters: CrashParameters = DEFAULT_CRASH_PARAMETERS

  load(data: any): void {
    this.parameters = loadCrashParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateCrashParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): CrashParameters {
    return getDefaultCrashParameters()
  }
}

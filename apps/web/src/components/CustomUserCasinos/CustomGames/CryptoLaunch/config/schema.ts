// @ts-nocheck
import { z } from 'zod'
import { SoundData } from '@/components/CustomUserCasinos/shared/types/sound.types'

/**
 * Schema for validating crypto launch game parameters
 */
export const CryptoLaunchParametersSchema = z.object({
  // Base game parameters
  icon: z.object({
    url: z.string().min(1, 'Icon URL is required'),
  }),
  description: z.string().min(1, 'Description is required'),
  background: z.object({
    url: z.string().min(1, 'Background image URL is required'),
  }),

  // Game Settings
  betAmount: z
    .number()
    .min(1, 'Bet amount must be at least $1')
    .max(1000, 'Bet amount must be at most $1000')
    .positive('Bet amount must be positive'),

  startPrice: z
    .number()
    .min(0.1, 'Start price must be at least $0.10')
    .max(10, 'Start price must be at most $10.00')
    .positive('Start price must be positive'),

  minSellPrice: z
    .number()
    .min(0.1, 'Min sell price must be at least $0.10')
    .max(100, 'Min sell price must be at most $100.00')
    .positive('Min sell price must be positive'),

  startDay: z
    .number()
    .min(10, 'Start day must be at least day 10')
    .max(300, 'Start day must be at most day 300')
    .int('Start day must be an integer'),

  endDay: z
    .number()
    .min(70, 'End day must be at least day 70')
    .max(360, 'End day must be at most day 360')
    .int('End day must be an integer'),

  // Visual Settings
  chartColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Chart color must be a valid hex color'),

  // background: z
  //   .string()
  //   .regex(/^#[0-9A-F]{6}$/i, 'Background color must be a valid hex color'),

  highlightOpacity: z
    .number()
    .min(0, 'Opacity must be at least 0')
    .max(1, 'Opacity must be at most 1'),

  showXAxis: z.boolean(),

  showDayLabels: z.boolean(),

  showGrid: z.boolean(),

  gridColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Grid color must be a valid hex color'),

  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Text color must be a valid hex color'),
  particleIntensity: z
    .number()
    .min(1, 'Particle intensity must be at least 1')
    .max(10, 'Particle intensity must be at most 10'),
  animationDuration: z
    .number()
    .min(1000, 'Animation duration must be at least 1000ms')
    .max(60000, 'Animation duration must be at most 60000ms'),

  // Custom sound effects
  customSounds: z.object({
    gameStart: z.custom<SoundData>().optional()
      .describe('Custom sound for when game starts'),
    positiveBeep: z.custom<SoundData>().optional()
      .describe('Custom sound for crossing above sell line'),
    negativeBeep: z.custom<SoundData>().optional()
      .describe('Custom sound for crossing below sell line'),
    win: z.custom<SoundData>().optional()
      .describe('Custom sound for winning result'),
    loss: z.custom<SoundData>().optional()
      .describe('Custom sound for losing result'),
  }).optional()
    .describe('Custom sound effects for the game'),
})

/**
 * Schema for validating crypto launch game results
 */
export const CryptoLaunchResultSchema = z.object({
  timestamp: z.number().positive('Timestamp must be positive'),
  entryAmount: z.number().positive('Entry amount must be positive'),
  numberOfEntries: z.number().positive('Number of entries must be positive'),
  payout: z.number().nonnegative('Payout must be non-negative'),
  isWin: z.boolean(),
  coinName: z.string().min(1, 'Coin name is required'),
  finalPrice: z.number().positive('Final price must be positive'),
  maxPrice: z.number().positive('Max price must be positive'),
  sellPrice: z.number().positive('Sell price must be positive'),
  soldOnDay: z.number().nonnegative('Sold on day must be non-negative'),
  profitLoss: z.number(),
  multiplier: z.number().positive('Multiplier must be positive'),
})

/**
 * Validate crypto launch parameters with additional business logic
 */
export const validateCryptoLaunchParameters = (params: unknown) => {
  const result = CryptoLaunchParametersSchema.safeParse(params)

  if (!result.success) {
    return result
  }

  // Additional validation: ensure end day is at least 60 days after start day
  const data = result.data
  if (data.endDay - data.startDay < 60) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: 'custom',
          message: 'End day must be at least 60 days after start day',
          path: ['endDay'],
        },
      ]),
    }
  }

  return result
}

/**
 * Validate crypto launch result
 */
export const validateCryptoLaunchResult = (result: unknown) => {
  return CryptoLaunchResultSchema.safeParse(result)
}

/**
 * Type inference from schema
 */
export type ValidatedCryptoLaunchParameters = z.infer<typeof CryptoLaunchParametersSchema>
export type ValidatedCryptoLaunchResult = z.infer<typeof CryptoLaunchResultSchema>

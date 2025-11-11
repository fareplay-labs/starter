// @ts-nocheck
import { z } from 'zod'
import { type IConfig } from '@/components/CustomUserCasinos/config/IConfig'
import { type CardsParameters, DEFAULT_CARDS_PARAMETERS } from './types'
import { type SoundData } from '../../shared/types/sound.types'

// Background field metadata
const backgroundFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: true,
  supportsImage: true,
} as const

// Color field metadata for rarity colors
const simpleColorFieldMetadata = {
  supportsSolidColor: true,
  supportsGradient: false,
  supportsImage: false,
} as const

// Catalog item schema (DOM-based game)
const CatalogItemSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  iconUrl: z.string().min(1),
  description: z.string().optional(),
  tier: z.enum(['common', 'rare', 'epic', 'legendary']).optional(),
  multiplier: z.number().positive().optional(),
})

export const CardsParamsSchema = z.object({
  explorerName: z.string().optional(),
  challengerName: z.string().optional(),
  cryptonaughtName: z.string().optional(),
  explorerPrice: z.number().min(0),
  challengerPrice: z.number().min(0),
  cryptonaughtPrice: z.number().min(0),
  background: z
    .object({ url: z.string() })
    .describe('Background of the game area')
    .refine(() => true, { params: backgroundFieldMetadata }),
  commonColor: z
    .string()
    .describe('Color for common rarity cards')
    .refine(() => true, { params: simpleColorFieldMetadata })
    .optional(),
  rareColor: z
    .string()
    .describe('Color for rare rarity cards')
    .refine(() => true, { params: simpleColorFieldMetadata })
    .optional(),
  epicColor: z
    .string()
    .describe('Color for epic rarity cards')
    .refine(() => true, { params: simpleColorFieldMetadata })
    .optional(),
  legendaryColor: z
    .string()
    .describe('Color for legendary rarity cards')
    .refine(() => true, { params: simpleColorFieldMetadata })
    .optional(),
  iconSize: z.number().min(0).max(2).optional(),
  // Custom SFX
  customSounds: z
    .object({
      packSelect: z.custom<SoundData>().optional(),
      packOpen: z.custom<SoundData>().optional(),
      cardFlip: z.custom<SoundData>().optional(),
      cardReveal: z.custom<SoundData>().optional(),
      win: z.custom<SoundData>().optional(),
      lose: z.custom<SoundData>().optional(),
    })
    .optional(),
  cardsCatalog: z.array(CatalogItemSchema),
  packAssignments: z.object({
    explorer: z.array(z.number().int()).length(3),
    challenger: z.array(z.number().int()).length(6),
    cryptonaught: z.array(z.number().int()).length(9),
  }),
})

export const validateCardsParameters = (data: any): boolean => {
  try {
    CardsParamsSchema.parse(data)
    return true
  } catch {
    return false
  }
}

export const loadCardsParameters = (data: any): CardsParameters => {
  const merged = {
    ...DEFAULT_CARDS_PARAMETERS,
    ...data,
  }
  const result = CardsParamsSchema.safeParse(merged)
  if (!result.success) {
    return DEFAULT_CARDS_PARAMETERS
  }
  return merged
}

export const getDefaultCardsParameters = (): CardsParameters => DEFAULT_CARDS_PARAMETERS

export class CardsSchemaConfig implements IConfig {
  private parameters: CardsParameters = DEFAULT_CARDS_PARAMETERS

  load(data: any): void {
    this.parameters = loadCardsParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateCardsParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, reserved for side effects on config changes
  }

  getDefaultParameters(): CardsParameters {
    return getDefaultCardsParameters()
  }
}

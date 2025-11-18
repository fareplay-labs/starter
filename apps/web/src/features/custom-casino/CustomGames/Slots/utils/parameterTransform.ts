// @ts-nocheck
import { type SlotsParameters, type SynthConfig, DEFAULT_SLOTS_PARAMETERS } from '../types'

/**
 * Transform flat parameter structure to nested structure for custom sounds
 */
export function extractCustomSounds(parameters: SlotsParameters): SlotsParameters['customSounds'] {
  if (!parameters) return undefined

  const flatParams = parameters as any

  return {
    spinStart: flatParams['customSounds.spinStart'],
    reelStop: flatParams['customSounds.reelStop'],
    winSound: flatParams['customSounds.winSound'],
    bigWin: flatParams['customSounds.bigWin'],
    megaWin: flatParams['customSounds.megaWin'],
    coinDrop: flatParams['customSounds.coinDrop'],
  }
}

/**
 * Transform flat parameter structure to nested structure for synth config
 * Uses defaults from DEFAULT_SLOTS_PARAMETERS to avoid duplication
 */
export function extractSynthConfig(parameters: SlotsParameters): SynthConfig {
  // Use the default config as a fallback - we know it's always defined in DEFAULT_SLOTS_PARAMETERS
  const defaultConfig: SynthConfig = DEFAULT_SLOTS_PARAMETERS.synthConfig || {
    clickEnabled: true,
    clickStyle: 'modern',
    clickPitch: 0,
    clickVolume: 0.5,
    whirrEnabled: false,
    whirrPitch: 0.5,
    whirrVolume: 0.15,
  }

  if (!parameters) return defaultConfig

  const flatParams = parameters as any

  return {
    clickEnabled: flatParams['synthConfig.clickEnabled'] ?? defaultConfig.clickEnabled,
    clickStyle: flatParams['synthConfig.clickStyle'] ?? defaultConfig.clickStyle,
    clickPitch: flatParams['synthConfig.clickPitch'] ?? defaultConfig.clickPitch,
    clickVolume: flatParams['synthConfig.clickVolume'] ?? defaultConfig.clickVolume,
    whirrEnabled: flatParams['synthConfig.whirrEnabled'] ?? defaultConfig.whirrEnabled,
    whirrPitch: flatParams['synthConfig.whirrPitch'] ?? defaultConfig.whirrPitch,
    whirrVolume: flatParams['synthConfig.whirrVolume'] ?? defaultConfig.whirrVolume,
  }
}

/**
 * Merge flat parameters with extracted nested structures
 * This eliminates the need for parametersWithNested
 */
export function transformParameters(parameters: SlotsParameters): SlotsParameters {
  return {
    ...parameters,
    customSounds: extractCustomSounds(parameters),
    synthConfig: extractSynthConfig(parameters),
  }
}

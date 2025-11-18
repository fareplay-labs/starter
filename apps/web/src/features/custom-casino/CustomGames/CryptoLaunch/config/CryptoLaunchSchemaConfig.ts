// @ts-nocheck
import { GameConfig } from '../../../config/GameConfig'
import {
  type CryptoLaunchParameters,
  DEFAULT_CRYPTO_LAUNCH_PARAMETERS,
  CRYPTO_LAUNCH_CONSTRAINTS,
} from '../types'

/**
 * Configuration class for the Crypto Launch game
 */
export class CryptoLaunchSchemaConfig extends GameConfig<CryptoLaunchParameters> {
  protected getDefaultParameters(): CryptoLaunchParameters {
    return DEFAULT_CRYPTO_LAUNCH_PARAMETERS
  }

  protected getParameterConstraints() {
    return CRYPTO_LAUNCH_CONSTRAINTS
  }

  // Override config properties specific to CryptoLaunch
  name = 'Crypto Launch'
  icon = '��'
  description = 'Trade a crypto token over time and try to sell above your minimum price!'

  // Game-specific styling
  colors = {
    themeColor1: '#00ff88', // Crypto green
    themeColor2: '#1a1a2e', // Dark blue
    themeColor3: '#16213e', // Darker blue
  }

  window = {
    width: '900px',
    height: '600px',
    backgroundColor: '#0a0a0a',
  }

  protected applyGameSpecific(): void {
    // This method is intentionally left empty
    // The visual changes are handled by the game components and hooks
    // When parameters are updated, the components will apply those changes to the UI
  }

  /**
   * Validate parameters specific to CryptoLaunch game
   */
  protected validateParameters(params: Partial<CryptoLaunchParameters>): boolean {
    try {
      // Game settings validation
      if (params.betAmount && (params.betAmount < 1 || params.betAmount > 1000)) {
        return false
      }

      if (params.startPrice && (params.startPrice < 0.1 || params.startPrice > 10)) {
        return false
      }

      if (params.minSellPrice && (params.minSellPrice < 0.1 || params.minSellPrice > 100)) {
        return false
      }

      if (params.startDay && (params.startDay < 10 || params.startDay > 300)) {
        return false
      }

      if (params.endDay && (params.endDay < 70 || params.endDay > 360)) {
        return false
      }

      // Business logic validation: ensure end day is at least 60 days after start day
      if (params.startDay && params.endDay && params.endDay - params.startDay < 60) {
        return false
      }

      // Color validation (basic hex check)
      const hexColorPattern = /^#[0-9A-F]{6}$/i
      if (params.chartColor && !hexColorPattern.test(params.chartColor)) {
        return false
      }

      if (params.backgroundColor && !hexColorPattern.test(params.backgroundColor)) {
        return false
      }

      return true
    } catch (error) {
      console.error('CryptoLaunch parameter validation error:', error)
      return false
    }
  }
}

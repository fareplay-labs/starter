// @ts-nocheck
import { GameConfig } from '../../config/GameConfig'
import { type RPSGameParameters, type RPSAnimationPreset, RPS_CONSTRAINTS, DEFAULT_RPS_PARAMETERS } from './types'

/**
 * Configuration for the Rock Paper Scissors game
 */
export class RPSConfig extends GameConfig<RPSGameParameters> {
  protected getDefaultParameters(): RPSGameParameters {
    return DEFAULT_RPS_PARAMETERS
  }

  protected validateParameters(params: Partial<RPSGameParameters>): boolean {
    if (params.handSize !== undefined) {
      const { min, max } = RPS_CONSTRAINTS.handSize
      if (params.handSize < min || params.handSize > max) {
        return false
      }
    }

    if (params.animationSpeed !== undefined) {
      const { min, max } = RPS_CONSTRAINTS.animationSpeed
      if (params.animationSpeed < min || params.animationSpeed > max) {
        return false
      }
    }

    if (params.primaryColor !== undefined) {
      if (!this.isValidColor(params.primaryColor)) {
        return false
      }
    }

    if (params.secondaryColor !== undefined) {
      if (!this.isValidColor(params.secondaryColor)) {
        return false
      }
    }

    if (params.winColor !== undefined) {
      if (!this.isValidColor(params.winColor)) {
        return false
      }
    }

    if (params.loseColor !== undefined) {
      if (!this.isValidColor(params.loseColor)) {
        return false
      }
    }

    if (params.animationPreset !== undefined) {
      if (!this.isValidAnimationPreset(params.animationPreset)) {
        return false
      }
    }

    if (params.glowEffect !== undefined) {
      if (typeof params.glowEffect !== 'boolean') {
        return false
      }
    }

    if (params.showResultText !== undefined) {
      if (typeof params.showResultText !== 'boolean') {
        return false
      }
    }

    return true
  }

  protected applyGameSpecific(): void {
    // This method is intentionally left empty
    // The visual changes are handled by the useParameterSync hook in RPSGame.tsx
    // When parameters are updated, the hook will apply those changes to the UI
  }

  // Helper methods for validation
  private isValidColor(color: string): boolean {
    return !!color && typeof color === 'string' && !!color.match(/^#([0-9A-F]{3}){1,2}$/i)
  }

  private isValidAnimationPreset(preset: RPSAnimationPreset): boolean {
    const validPresets: RPSAnimationPreset[] = ['standard', 'clash', 'laser']
    return validPresets.includes(preset)
  }
}

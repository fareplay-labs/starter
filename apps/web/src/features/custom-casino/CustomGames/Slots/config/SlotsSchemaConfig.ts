// @ts-nocheck
import { type IConfig } from '@/features/custom-casino/config/IConfig'
import { type SlotsParameters, DEFAULT_SLOTS_PARAMETERS } from '../types'
import { validateSlotsParameters, loadSlotsParameters } from './schema'

/**
 * Schema-based config class for Slots game
 * Replaces SlotsConfig with Zod-based validation
 */
export class SlotsSchemaConfig implements IConfig {
  private parameters: SlotsParameters = DEFAULT_SLOTS_PARAMETERS

  load(data: any): void {
    this.parameters = loadSlotsParameters(data)
  }

  save(): any {
    return this.parameters
  }

  validate(): boolean {
    return validateSlotsParameters(this.parameters)
  }

  apply(): void {
    // No-op for now, could be used for side effects when config changes
  }

  getDefaultParameters(): SlotsParameters {
    return DEFAULT_SLOTS_PARAMETERS
  }

  getParameters(): SlotsParameters {
    return this.parameters
  }
}

// @ts-nocheck

/**
 * ============================================================================
 * DEPRECATION NOTICE
 * ============================================================================
 *
 * All components in this directory have been migrated to Tailwind CSS.
 *
 * >>> USE './tailwind' INSTEAD <<<
 *
 * Import from './tailwind' for all new code:
 *
 *   import {
 *     StandardFormLayout,
 *     LabelledNumberSliderInput,
 *     DemoSubmitButton,
 *     // ... etc
 *   } from './tailwind'
 *
 * The styled-components versions below are kept for backward compatibility
 * with any remaining legacy code but should be considered DEPRECATED.
 *
 * ============================================================================
 */

// Re-export everything from the new Tailwind-based components
export * from './tailwind'

// ============================================================================
// DEPRECATED EXPORTS - DO NOT USE IN NEW CODE
// These are kept only for backward compatibility
// ============================================================================

// Game-specific components that may still be imported directly
// (Roulette has its own complex styled components in ./styles/RouletteFormStyles.ts)
export { SlotsSimulationControl } from './SlotsSimulationControl'

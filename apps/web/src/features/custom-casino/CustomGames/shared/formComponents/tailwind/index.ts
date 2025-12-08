/**
 * Tailwind-based form components
 *
 * These components replace the styled-components versions in the parent directory.
 * Import from here for all game form implementations.
 *
 * All form components have been migrated to Tailwind/shadcn.
 */

// Layout components
export { StandardFormLayout } from './StandardFormLayout'
export { FormGroup } from './FormGroup'

// Input components
export { NumberInput } from './NumberInput'
export { ThemedSlider } from './ThemedSlider'
export { LabelledNumberSliderInput } from './LabelledNumberSliderInput'
export { TargetRollSlider } from './TargetRollSlider'

// Selection components
export { BannerSelect } from './BannerSelect'
export type { BannerOption } from './BannerSelect'
export { ChoiceButtons } from './ChoiceButtons'

// Button components
export { DemoSubmitButton } from './DemoSubmitButton'
export { SimulationControl } from './SimulationControl'

// Status components
export { FormErrorDisplay } from './FormErrorDisplay'
export { GameStats } from './GameStats'
export { DemoModeToggle } from './DemoModeToggle'

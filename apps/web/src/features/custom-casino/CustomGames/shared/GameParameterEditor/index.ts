// @ts-nocheck
// Export main components
export { default as GameParameterEditor } from './GameParameterEditor'
export { default as ParameterControl } from './ParameterControl'

// Export types, but not the ones that conflict with existing exports
export type {
  ParameterType,
  ParameterDefinition,
  ParameterSection,
  GameEditorMetadata,
  GameParameterEditorProps,
  ParameterControlProps,
  ColorControlProps,
  SelectControlProps,
  SliderControlProps,
  ToggleControlProps,
} from './types'

// Export control components
export { default as SliderControl } from './controls/SliderControl'
export { default as ColorControl } from './controls/ColorControl'
export { default as SelectControl } from './controls/SelectControl'
export { default as ToggleControl } from './controls/ToggleControl'
export { default as PayoutControl } from './controls/PayoutControl'

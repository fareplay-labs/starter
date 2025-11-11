// @ts-nocheck
import { type BaseGameParameters } from '../types'
import {
  type PayoutTableEntry,
  type SlotsParameters,
} from 'src/components/CustomUserCasinos/CustomGames/Slots/types'
/**
 * Parameter types supported by the editor
 */
export type ParameterType =
  | 'number'
  | 'color'
  | 'select'
  | 'multiselect'
  | 'boolean'
  | 'string'
  | 'image'
  | 'payoutTable'
  | 'slotIcons'
  | 'slotSymbols'
  | 'sound'
  | 'catalog'
  | 'assignments'
  | 'keyValueList'
  | 'objectArray'
  | 'packConfiguration'
  | 'array'

/**
 * Base definition for a parameter
 */
interface BaseParameterDefinition {
  id: string
  label: string
  description?: string
  disabled?: boolean
  /**
   * Optional conditional rendering – if provided this parameter is only shown when
   * the condition is met.
   */
  condition?: {
    /** id of the controlling parameter */
    param: string
    /** value which must strictly equal for this param to be visible */
    equals?: any
    /** value which must NOT equal for this param to be visible */
    notEquals?: any
  }
}

/**
 * Definition for standard parameter types
 */
interface StandardParameterDefinition extends BaseParameterDefinition {
  type: ParameterType
  defaultValue: any
  constraints?: {
    min?: number
    max?: number
    step?: number
  }
  options?: Array<{
    value: string
    label: string
  }>
  /**
   * Sound specific options. Relevant only when `type === 'sound'`.
   */
  soundOptions?: {
    soundContext: string // e.g., "Dice Roll Start"
  }
  colorOptions?: {
    /** If true the color control should expose a solid color mode UI (defaults to true) */
    allowSolid?: boolean
    allowGradient?: boolean
    allowAlpha?: boolean
    /** If true the color control should show linear gradient direction options */
    allowLinearGradient?: boolean
    /** If true the color control should show radial gradient options */
    allowRadialGradient?: boolean
    /** @deprecated Use allowLinearGradient instead */
    allowGradientDirection?: boolean
    allowImage?: boolean
    allowAIGen?: boolean
    imageAspectRatio?: number
    imageType?: 'background' | 'tile' | 'icon' | 'asset'
    /** Shape of the crop area when editing images */
    cropShape?: 'rect' | 'round'
  }
  /**
   * Catalog specific options. Relevant only when `type === 'catalog'`.
   */
  catalogOptions?: {
    /** Fields to display/edit for each catalog item */
    fields?: Array<{
      key: string
      label: string
      type: 'string' | 'url' | 'select' | 'number'
      required?: boolean
      options?: Array<{ value: string; label: string }>
      /** For URL fields: image aspect ratio */
      imageAspectRatio?: number
      /** For URL fields: image type */
      imageType?: 'background' | 'tile' | 'icon' | 'asset'
      /** For URL fields: crop shape */
      cropShape?: 'rect' | 'round'
      /** For URL fields: allow AI generation */
      allowAIGen?: boolean
      /** For URL fields: allow emoji selection */
      allowEmoji?: boolean
    }>
    /** Allow adding new items */
    allowAdd?: boolean
    /** Allow removing items */
    allowRemove?: boolean
    /** Default items to seed with */
    seedDefaults?: any[]
  }
  /**
   * Assignments specific options. Relevant only when `type === 'assignments'`.
   */
  assignmentsOptions?: {
    /** Reference to catalog parameter ID */
    catalogRef?: string
    /** Pack types configuration */
    packTypes?: Array<{
      id: string
      name: string
      cardCount: number
    }>
  }
  /**
   * Key-value list options. Relevant only when `type === 'keyValueList'`.
   */
  keyValueOptions?: {
    /** Label for the key field */
    keyLabel?: string
    /** Label for the value field */
    valueLabel?: string
    /** Type of the value field */
    valueType?: 'string' | 'number' | 'boolean'
  }
  /**
   * Object array options. Relevant only when `type === 'objectArray'`.
   */
  objectArrayOptions?: {
    /** Fields configuration for each object */
    fields: Array<{
      key: string
      label: string
      type: 'string' | 'number' | 'boolean' | 'select' | 'url'
      required?: boolean
      options?: Array<{ value: string; label: string }>
      /** For URL fields: image aspect ratio */
      imageAspectRatio?: number
      /** For URL fields: image type */
      imageType?: 'background' | 'tile' | 'icon' | 'asset'
      /** For URL fields: crop shape */
      cropShape?: 'rect' | 'round'
      /** For URL fields: allow AI generation */
      allowAIGen?: boolean
      /** For URL fields: allow emoji selection */
      allowEmoji?: boolean
    }>
    /** Allow adding new objects */
    allowAdd?: boolean
    /** Allow removing objects */
    allowRemove?: boolean
    /** Minimum number of objects required */
    minItems?: number
  }
  /**
   * Array options. Relevant only when `type === 'array'`.
   */
  arrayOptions?: {
    /** Type of array items */
    itemType?: 'string' | 'number'
    /** Fixed length array (no add/remove buttons) */
    fixedLength?: number
    /** Custom labels for each item */
    itemLabels?: string[]
  }
}

/**
 * Definition of a parameter and its editing constraints
 */
export type ParameterDefinition = StandardParameterDefinition

/**
 * A section of grouped parameters
 */
export interface ParameterSection {
  id: string
  title: string
  parameters: ParameterDefinition[]
  /** If false, section cannot be collapsed (defaults to true) */
  collapsible?: boolean
}

/**
 * Metadata for a game's editor
 */
export interface GameEditorMetadata {
  gameType: string
  sections: ParameterSection[]
}

/**
 * Props for the main GameParameterEditor component
 */
export interface GameParameterEditorProps<T extends BaseGameParameters> {
  parameters: Partial<T>
  gameType: string
  onChange: (params: Partial<T>) => void
  userAddress?: string
  onSave?: () => Promise<boolean>
}

/**
 * Props for parameter section component
 */
export interface ParameterSectionProps {
  title: string
  parameters: Record<string, any>
  allParameters?: Record<string, any>
  parameterDefs: ParameterDefinition[]
  onChange: (paramName: string, value: any) => void
  collapsible?: boolean
  gameType?: string
  userAddress?: string
  onSave?: () => Promise<boolean>
}

/**
 * Props for individual parameter control
 */
export interface ParameterControlProps {
  definition: ParameterDefinition
  parameters: any
  onPayoutTableChange?: (newPayoutTable: PayoutTableEntry[]) => void
  value: any
  onChange: (value: any) => void
  allParameters?: Record<string, any>
  gameType?: string
  userAddress?: string
  onSave?: () => Promise<boolean>
}

/**
 * Props for slider control
 */
export interface SliderControlProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label: string
}

/**
 * Props for color control
 */
export interface ColorControlProps {
  value: string
  onChange: (value: string) => void
  label: string
  parameterId: string
  /** Enable solid color mode toggle (defaults to true) */
  allowSolid?: boolean
  /** Enable gradient mode toggle */
  allowGradient?: boolean
  /** Enable alpha / transparency editing */
  allowAlpha?: boolean
  /** Enable linear gradient direction selector */
  allowLinearGradient?: boolean
  /** Enable radial gradient options */
  allowRadialGradient?: boolean
  /** @deprecated Use allowLinearGradient instead */
  allowGradientDirection?: boolean
  /** Enable emoji selection option */
  allowEmoji?: boolean
  /** Enable image selection option */
  allowImage?: boolean
  /** Enable AI image generation */
  allowAIGen?: boolean
  /** Aspect ratio for image cropping */
  imageAspectRatio?: number
  /** Type of image being edited */
  imageType?: 'background' | 'tile' | 'icon' | 'asset'
  /** Shape of the crop area when editing images */
  cropShape?: 'rect' | 'round'
  /** Game type for AI generation */
  gameType?: string
  /** User address for AI generation */
  userAddress?: string
  /** Callback to save changes to backend */
  onSave?: () => Promise<boolean>
}

/**
 * Props for select control
 */
export interface SelectControlProps {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
}

/**
 * Props for multiselect control
 */
export interface MultiSelectControlProps {
  value: string[]
  onChange: (value: string[]) => void
  options: Array<{ value: string; label: string }>
  label: string
}

/**
 * Props for toggle control
 */
export interface ToggleControlProps {
  value: boolean
  onChange: (value: boolean) => void
  label: string
}

export interface PayoutTableProps {
  payoutTable: PayoutTableEntry[]
  parameters: SlotsParameters
  onChange: (value: PayoutTableEntry[]) => void
}

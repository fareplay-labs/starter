// @ts-nocheck
import {
  type ParameterDefinition,
  type GameEditorMetadata,
} from '@/features/custom-casino/CustomGames/shared/GameParameterEditor/types'
import { DEFAULT_SLOTS_PARAMETERS } from '../types'
import { AppGameName } from '@/chains/types'

export const SLOTS_METADATA: Record<string, ParameterDefinition> = {
  // Visual Theme Section
  background: {
    id: 'background',
    type: 'color',
    label: 'Background',
    defaultValue: '#1a1a2e',
    colorOptions: {
      allowGradient: true,
      allowAlpha: true,
      allowImage: true,
      allowLinearGradient: true,
      allowRadialGradient: true,
    },
    description: 'Main game background (supports gradients and images)',
  },

  reelBackground: {
    id: 'reelBackground',
    type: 'color',
    label: 'Reel Background',
    defaultValue: '#0a0a1e',
    colorOptions: {
      allowGradient: true,
      allowAlpha: true,
      allowLinearGradient: true,
      allowRadialGradient: true,
    },
    description: 'Background inside each reel (aspect ratio 1:3 - width:height)',
  },

  reelContainer: {
    id: 'reelContainer',
    type: 'color',
    label: 'Reel Container',
    defaultValue: '#2c3e50',
    colorOptions: {
      allowGradient: true,
      allowAlpha: true,
      allowLinearGradient: true,
      allowRadialGradient: true,
    },
    description: 'Background of the container holding all reels (~5:3 ratio for 5 reels)',
  },

  borderColor: {
    id: 'borderColor',
    type: 'color',
    label: 'Border Color',
    defaultValue: '#1a1a2e',
    colorOptions: {
      allowGradient: false,
      allowAlpha: true,
    },
    description: 'Border color for container and reels',
  },

  paylineIndicator: {
    id: 'paylineIndicator',
    type: 'color',
    label: 'Payline Indicator',
    defaultValue: 'rgba(255, 215, 0, 0.3)',
    colorOptions: {
      allowGradient: false,
      allowAlpha: true,
    },
    description: 'Color of the center payline indicator',
  },

  winColor: {
    id: 'winColor',
    type: 'color',
    label: 'Win Color',
    defaultValue: '#4ade80',
    colorOptions: {
      allowGradient: false,
      allowAlpha: true,
    },
    description: 'Color for win indicators and effects',
  },

  // Slot Symbols Section
  slotsSymbols: {
    id: 'slotsSymbols',
    type: 'slotSymbols',
    label: 'Slot Symbols',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.slotsSymbols,
    description:
      'Configure the symbols that appear on the reels (7 symbols, lowest to highest tier). Recommended to use square aspect ratio images.',
  },

  // Size Controls
  iconSize: {
    id: 'iconSize',
    type: 'number',
    label: 'Icon Size',
    defaultValue: 1.0,
    constraints: {
      min: 0.7,
      max: 2.0,
      step: 0.1,
    },
    description: 'Size of the icons within reels (0.7 to 2.0)',
  },

  gameScale: {
    id: 'gameScale',
    type: 'number',
    label: 'Game Scale',
    defaultValue: 1.0,
    constraints: {
      min: 0.7,
      max: 1.4,
      step: 0.1,
    },
    description: 'Overall scale of the game (0.7 to 1.4)',
  },
}

// Sound effect parameters
export const SLOTS_SOUND_METADATA: Record<string, ParameterDefinition> = {
  'customSounds.spinStart': {
    id: 'customSounds.spinStart',
    type: 'sound',
    label: 'Spin Start Sound',
    defaultValue: undefined,
    description: 'Sound played when starting a spin (lever pull)',
    soundOptions: {
      soundContext: 'Spin Start',
    },
  },
  'customSounds.reelStop': {
    id: 'customSounds.reelStop',
    type: 'sound',
    label: 'Reel Stop Sound',
    defaultValue: undefined,
    description: 'Sound played when each reel stops',
    soundOptions: {
      soundContext: 'Reel Stop',
    },
  },
  'customSounds.winSound': {
    id: 'customSounds.winSound',
    type: 'sound',
    label: 'Win Sound',
    defaultValue: undefined,
    description: 'Sound played for standard wins',
    soundOptions: {
      soundContext: 'Win Celebration',
    },
  },
  'customSounds.bigWin': {
    id: 'customSounds.bigWin',
    type: 'sound',
    label: 'Big Win Sound',
    defaultValue: undefined,
    description: 'Sound played for big wins (5x-10x)',
    soundOptions: {
      soundContext: 'Big Win',
    },
  },
  'customSounds.megaWin': {
    id: 'customSounds.megaWin',
    type: 'sound',
    label: 'Mega Win Sound',
    defaultValue: undefined,
    description: 'Sound played for mega wins (10x+)',
    soundOptions: {
      soundContext: 'Mega Win',
    },
  },
  'customSounds.coinDrop': {
    id: 'customSounds.coinDrop',
    type: 'sound',
    label: 'Coin Collection Sound',
    defaultValue: undefined,
    description: 'Sound played multiple times during coin collection animation on medium+ wins',
    soundOptions: {
      soundContext: 'Coin Collection (loops during win celebration)',
    },
  },
}

// Animation configuration parameters
export const SLOTS_ANIMATION_METADATA: Record<string, ParameterDefinition> = {
  animationDirections: {
    id: 'animationDirections',
    type: 'multiselect',
    label: 'Spin Directions',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.animationDirections,
    options: [
      { value: 'forward', label: 'Up' },
      { value: 'backward', label: 'Down' },
      { value: 'random', label: 'Random Per Reel' },
      { value: 'alternating', label: 'Alternating' },
    ],
    description: 'How reels spin (randomly selected each spin)',
  },
  reelStopOrders: {
    id: 'reelStopOrders',
    type: 'multiselect',
    label: 'Stop Patterns',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.reelStopOrders,
    options: [
      { value: 'sequential', label: 'Left to Right' },
      { value: 'reverse', label: 'Right to Left' },
      { value: 'random', label: 'Random Order' },
      { value: 'center-out', label: 'Center Outward' },
      { value: 'edges-in', label: 'Edges Inward' },
      { value: 'alternating', label: 'Alternating' },
    ],
    description: 'Order reels stop (randomly selected each spin)',
  },
  animationStrategies: {
    id: 'animationStrategies',
    type: 'multiselect',
    label: 'Animation Styles',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.animationStrategies,
    options: [
      { value: 'basicStandard', label: 'Basic (Smooth)' },
      { value: 'turboStandard', label: 'Turbo (Fast)' },
      { value: 'cascade', label: 'Cascade Effect' },
      { value: 'nearMiss', label: 'Near Miss Tease' },
      { value: 'bigWin', label: 'Big Win Celebration' },
      { value: 'jackpot', label: 'Jackpot Drama' },
    ],
    description: 'Animation styles (game picks based on win/loss)',
  },
}

// Synthesizer configuration parameters
export const SLOTS_SYNTH_METADATA: Record<string, ParameterDefinition> = {
  // Click sound parameters
  'synthConfig.clickEnabled': {
    id: 'synthConfig.clickEnabled',
    type: 'boolean',
    label: 'Enable Click Sounds',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.clickEnabled,
    description: 'Enable clicking sounds as reels spin',
  },
  'synthConfig.clickStyle': {
    id: 'synthConfig.clickStyle',
    type: 'select',
    label: 'Click Style',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.clickStyle,
    options: [
      { value: 'classic', label: 'Classic Mechanical' },
      { value: 'modern', label: 'Modern Electronic' },
      { value: 'minimal', label: 'Soft Minimal' },
    ],
    description: 'Style of clicking sounds',
    condition: {
      param: 'synthConfig.clickEnabled',
      notEquals: false, // Shows when undefined (initial) or true
    },
  },
  'synthConfig.clickPitch': {
    id: 'synthConfig.clickPitch',
    type: 'number',
    label: 'Click Pitch',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.clickPitch,
    constraints: {
      min: -1,
      max: 1,
      step: 0.1,
    },
    description: 'Adjust pitch (-1 low, 0 normal, 1 high)',
    condition: {
      param: 'synthConfig.clickEnabled',
      notEquals: false, // Shows when undefined (initial) or true
    },
  },
  'synthConfig.clickVolume': {
    id: 'synthConfig.clickVolume',
    type: 'number',
    label: 'Click Volume',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.clickVolume,
    constraints: {
      min: 0,
      max: 1,
      step: 0.1,
    },
    description: 'Volume multiplier for click sounds',
    condition: {
      param: 'synthConfig.clickEnabled',
      notEquals: false, // Shows when undefined (initial) or true
    },
  },

  // Whirr sound parameters
  'synthConfig.whirrEnabled': {
    id: 'synthConfig.whirrEnabled',
    type: 'boolean',
    label: 'Enable Whirr Sound',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.whirrEnabled,
    description: 'Enable ambient whirring sound during spin',
  },
  'synthConfig.whirrPitch': {
    id: 'synthConfig.whirrPitch',
    type: 'number',
    label: 'Whirr Pitch',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.whirrPitch,
    constraints: {
      min: -1,
      max: 1,
      step: 0.1,
    },
    description: 'Adjust pitch (-1 low, 0 normal, 1 high)',
    condition: {
      param: 'synthConfig.whirrEnabled',
      equals: true,
    },
  },
  'synthConfig.whirrVolume': {
    id: 'synthConfig.whirrVolume',
    type: 'number',
    label: 'Whirr Volume',
    defaultValue: DEFAULT_SLOTS_PARAMETERS.synthConfig!.whirrVolume,
    constraints: {
      min: 0,
      max: 1,
      step: 0.1,
    },
    description: 'Volume multiplier for whirr sound',
    condition: {
      param: 'synthConfig.whirrEnabled',
      equals: true,
    },
  },
}

// Main editor metadata with proper structure
export const SLOTS_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Slots_1,
  sections: [
    {
      id: 'visual',
      title: 'Visual',
      collapsible: true,
      parameters: [
        SLOTS_METADATA.background,
        SLOTS_METADATA.reelBackground,
        SLOTS_METADATA.reelContainer,
        SLOTS_METADATA.borderColor,
        SLOTS_METADATA.paylineIndicator,
        SLOTS_METADATA.winColor,
        SLOTS_METADATA.iconSize,
        SLOTS_METADATA.gameScale,
      ],
    },
    {
      id: 'animation',
      title: 'Animation',
      collapsible: true,
      parameters: [
        SLOTS_ANIMATION_METADATA.animationDirections,
        SLOTS_ANIMATION_METADATA.reelStopOrders,
        SLOTS_ANIMATION_METADATA.animationStrategies,
      ],
    },
    {
      id: 'synthesizer',
      title: 'Synth Sounds',
      collapsible: true,
      parameters: [
        // Click sounds
        SLOTS_SYNTH_METADATA['synthConfig.clickEnabled'],
        SLOTS_SYNTH_METADATA['synthConfig.clickStyle'],
        SLOTS_SYNTH_METADATA['synthConfig.clickPitch'],
        SLOTS_SYNTH_METADATA['synthConfig.clickVolume'],
        // Whirr sounds
        SLOTS_SYNTH_METADATA['synthConfig.whirrEnabled'],
        SLOTS_SYNTH_METADATA['synthConfig.whirrPitch'],
        SLOTS_SYNTH_METADATA['synthConfig.whirrVolume'],
      ],
    },
    {
      id: 'sounds',
      title: 'SFX',
      collapsible: true,
      parameters: [
        SLOTS_SOUND_METADATA['customSounds.spinStart'],
        SLOTS_SOUND_METADATA['customSounds.reelStop'],
        SLOTS_SOUND_METADATA['customSounds.winSound'],
        SLOTS_SOUND_METADATA['customSounds.bigWin'],
        SLOTS_SOUND_METADATA['customSounds.megaWin'],
        SLOTS_SOUND_METADATA['customSounds.coinDrop'],
      ],
    },
    {
      id: 'symbols',
      title: 'Symbols',
      collapsible: true,
      parameters: [SLOTS_METADATA.slotsSymbols],
    },
  ],
}

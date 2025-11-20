// @ts-nocheck
import { type GameEditorMetadata } from '../shared/GameParameterEditor/types'
import { AppGameName } from '@/chains/types'
import { CRASH_CONSTRAINTS, DEFAULT_CRASH_PARAMETERS } from './types'

// Crash game editor metadata
export const CRASH_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Crash,
  sections: [
    // Visual Settings section
    {
      id: 'visual',
      title: 'Visual Settings',
      parameters: [
        {
          id: 'background',
          label: 'Background',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowAlpha: true,
            allowGradientDirection: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'background',
            imageAspectRatio: 16 / 9,
          },
          defaultValue: DEFAULT_CRASH_PARAMETERS.background.url,
          description: 'Background of the crash graph area',
        },
        {
          id: 'rocketAppearance',
          label: 'Rocket Appearance',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowAlpha: true,
            allowGradientDirection: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
          },
          defaultValue:
            typeof DEFAULT_CRASH_PARAMETERS.rocketAppearance === 'string' ?
              DEFAULT_CRASH_PARAMETERS.rocketAppearance
            : DEFAULT_CRASH_PARAMETERS.rocketAppearance.url,
          description:
            'Rocket appearance - supports colors, gradients, images, and AI generation. Images are rotated to follow movement direction.',
        },
        {
          id: 'rocketSize',
          type: 'number' as const,
          label: 'Rocket Size',
          description: 'Size of the rocket in pixels',
          defaultValue: DEFAULT_CRASH_PARAMETERS.rocketSize,
          constraints: CRASH_CONSTRAINTS.rocketSize,
        },
        {
          id: 'rotateTowardsDirection',
          type: 'boolean' as const,
          label: 'Rotate Towards Direction',
          description: 'Whether the rocket rotates to face its direction of travel',
          defaultValue: true,
        },
        {
          id: 'lineColor',
          label: 'Line Color',
          type: 'color',
          colorOptions: {
            allowGradient: false,
            allowAlpha: true,
            allowGradientDirection: false,
            allowImage: false,
            allowAIGen: false,
          },
          defaultValue: DEFAULT_CRASH_PARAMETERS.lineColor,
          description: 'Color of the rising crash line',
        },
        {
          id: 'textColor',
          label: 'Text Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.textColor,
          description: 'Color of text elements',
        },
        {
          id: 'crashColor',
          label: 'Crash Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.crashColor,
          description: 'Color when crash occurs',
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.winColor,
          description: 'Color for successful cash out',
        },
        {
          id: 'graphSize',
          label: 'Graph Size',
          type: 'number',
          defaultValue: DEFAULT_CRASH_PARAMETERS.graphSize,
          description: 'Relative size of the graph (scale factor)',
          constraints: CRASH_CONSTRAINTS.graphSize,
        },
      ],
    },

    // Game Settings section
    {
      id: 'game',
      title: 'Game Settings',
      parameters: [
        {
          id: 'gameSpeed',
          label: 'Game Speed',
          type: 'number',
          defaultValue: DEFAULT_CRASH_PARAMETERS.gameSpeed,
          description: 'Speed of the multiplier acceleration (higher = faster multiplier increase)',
          constraints: CRASH_CONSTRAINTS.gameSpeed,
        },
        {
          id: 'lineThickness',
          label: 'Line Thickness',
          type: 'number',
          defaultValue: DEFAULT_CRASH_PARAMETERS.lineThickness,
          description: 'Thickness of the crash line in pixels',
          constraints: CRASH_CONSTRAINTS.lineThickness,
        },
        {
          id: 'particleIntensity',
          label: 'Particle Intensity',
          type: 'number',
          defaultValue: DEFAULT_CRASH_PARAMETERS.particleIntensity,
          description: 'Intensity of particle effects (1=minimal, 10=ridiculous)',
          constraints: CRASH_CONSTRAINTS.particleIntensity,
        },
        {
          id: 'rocketEndingEffect',
          label: 'Rocket Ending Effect',
          type: 'select',
          options: [
            { value: 'fade', label: 'Fade Out' },
            { value: 'physics', label: 'Physics Crash' },
          ],
          defaultValue: 'physics',
          description: 'How the rocket behaves when the game ends (crash or cash out)',
        },
      ],
    },

    // Grid Settings section
    {
      id: 'grid',
      title: 'Grid Settings',
      parameters: [
        {
          id: 'showGridlines',
          label: 'Show Gridlines',
          type: 'boolean',
          defaultValue: DEFAULT_CRASH_PARAMETERS.showGridlines,
          description: 'Display grid lines on the graph',
        },
        {
          id: 'gridColor',
          label: 'Grid Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.gridColor,
          description: 'Color of the grid lines',
          condition: {
            param: 'showGridlines',
            equals: true,
          },
        },
        {
          id: 'showGridLabels',
          label: 'Show Grid Labels',
          type: 'boolean',
          defaultValue: DEFAULT_CRASH_PARAMETERS.showGridLabels,
          description: 'Display labels on grid lines',
        },
        {
          id: 'gridTextColor',
          label: 'Grid Text Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.gridTextColor,
          description: 'Color of grid labels and text',
          condition: {
            param: 'showGridLabels',
            equals: true,
          },
        },
        {
          id: 'showAxes',
          label: 'Show Axes',
          type: 'boolean',
          defaultValue: DEFAULT_CRASH_PARAMETERS.showAxes,
          description: 'Display main axes lines',
        },
        {
          id: 'axesColor',
          label: 'Axes Color',
          type: 'color',
          defaultValue: DEFAULT_CRASH_PARAMETERS.axesColor,
          description: 'Color of the main axes lines',
          condition: {
            param: 'showAxes',
            equals: true,
          },
        },
        {
          id: 'showTargetLine',
          label: 'Show Target Line',
          type: 'boolean',
          defaultValue: DEFAULT_CRASH_PARAMETERS.showTargetLine,
          description: 'Display the target cash out line',
        },
      ],
    },

    // Text Settings section
    {
      id: 'text',
      title: 'Text Settings',
      parameters: [
        {
          id: 'winText',
          label: 'Win Text',
          type: 'string',
          defaultValue: DEFAULT_CRASH_PARAMETERS.winText,
          description: 'Text displayed when player successfully cashes out',
        },
        {
          id: 'lossText',
          label: 'Loss Text',
          type: 'string',
          defaultValue: DEFAULT_CRASH_PARAMETERS.lossText,
          description: 'Text displayed when the game crashes',
        },
      ],
    },

    // Sound Effects section
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.rocketLaunch',
          label: 'Rocket Launch Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when the rocket launches',
          soundOptions: {
            soundContext: 'Rocket Launch'
          }
        },
        {
          id: 'customSounds.cashOut',
          label: 'Cash Out Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when successfully cashing out',
          soundOptions: {
            soundContext: 'Cash Out'
          }
        },
        {
          id: 'customSounds.crashExplosion',
          label: 'Crash Explosion Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when the rocket crashes',
          soundOptions: {
            soundContext: 'Crash Explosion'
          }
        },
      ],
    },
  ],
}

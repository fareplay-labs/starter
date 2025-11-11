// @ts-nocheck
import { type GameEditorMetadata } from '../shared/GameParameterEditor/types'
import { AppGameName } from '@/chains/types'
import { ROULETTE_CONSTRAINTS, DEFAULT_ROULETTE_PARAMETERS } from './types'

export const ROULETTE_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Roulette,
  sections: [
    {
      id: 'layout',
      title: 'Layout Settings',
      parameters: [
        {
          id: 'layoutType',
          label: 'Layout Type',
          type: 'select',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.layoutType,
          description: 'Choose the visual style and behavior of the roulette game',
          options: [
            { value: 'spin', label: 'Spin' },
            // { value: 'scroll', label: 'Scroll - Slot machine style' },
            { value: 'tiles', label: 'Tiles' },
          ],
        },
      ],
    },

    {
      id: 'spin-layout',
      title: 'Spin Layout Settings',
      parameters: [
        {
          id: 'wheelRadius',
          label: 'Wheel Size',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.wheelRadius,
          description: 'Size of the roulette wheel in pixels',
          constraints: ROULETTE_CONSTRAINTS.wheelRadius,
          condition: {
            param: 'layoutType',
            equals: 'spin',
          },
        },
        {
          id: 'wheelAccentColor',
          label: 'Wheel Accent Color',
          type: 'color',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.wheelAccentColor,
          description: 'Color for wheel borders and accent elements',
          condition: {
            param: 'layoutType',
            equals: 'spin',
          },
        },
        {
          id: 'wheelBackground',
          label: 'Wheel Background',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowAlpha: true,
            allowLinearGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'background',
            imageAspectRatio: 1,
            cropShape: 'round',
          },
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.wheelBackground || '#0a0a0a',
          description: 'Background inside the wheel area',
          condition: {
            param: 'layoutType',
            equals: 'spin',
          },
        },
      ],
    },

    {
      id: 'scroll-layout',
      title: 'Scroll Layout Settings',
      parameters: [
        {
          id: 'scrollSpeed',
          label: 'Scroll Speed',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.scrollSpeed,
          description: 'Initial velocity of the scrolling animation',
          constraints: ROULETTE_CONSTRAINTS.scrollSpeed,
          condition: {
            param: 'layoutType',
            equals: 'scroll',
          },
        },
        {
          id: 'decelerationRate',
          label: 'Deceleration Rate',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.decelerationRate,
          description: 'How quickly the scroll slows down (0.1 = slow, 0.9 = fast)',
          constraints: ROULETTE_CONSTRAINTS.decelerationRate,
          condition: {
            param: 'layoutType',
            equals: 'scroll',
          },
        },
        {
          id: 'visibleNeighbors',
          label: 'Visible Neighbors',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.visibleNeighbors,
          description: 'How many numbers to show on each side of the active number',
          constraints: ROULETTE_CONSTRAINTS.visibleNeighbors,
          condition: {
            param: 'layoutType',
            equals: 'scroll',
          },
        },
        {
          id: 'neighborOpacity',
          label: 'Neighbor Opacity',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.neighborOpacity,
          description: 'Opacity of numbers adjacent to the active one (0.1 = very faded)',
          constraints: ROULETTE_CONSTRAINTS.neighborOpacity,
          condition: {
            param: 'layoutType',
            equals: 'scroll',
          },
        },
        {
          id: 'numberSize',
          label: 'Number Size',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.numberSize,
          description: 'Size of the displayed numbers in pixels',
          constraints: ROULETTE_CONSTRAINTS.numberSize,
          condition: {
            param: 'layoutType',
            equals: 'scroll',
          },
        },
      ],
    },

    {
      id: 'tiles-layout',
      title: 'Tiles Layout Settings',
      parameters: [
        {
          id: 'tileSize',
          label: 'Tile Size',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.tileSize,
          description: 'Size of individual tiles in pixels',
          constraints: ROULETTE_CONSTRAINTS.tileSize,
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          },
        },
        {
          id: 'tileSpacing',
          label: 'Tile Spacing',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.tileSpacing,
          description: 'Gap between tiles in pixels',
          constraints: ROULETTE_CONSTRAINTS.tileSpacing,
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          },
        },

        {
          id: 'tileBorderRadius',
          label: 'Border Radius',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.tileBorderRadius,
          description: 'Corner rounding for tiles',
          constraints: ROULETTE_CONSTRAINTS.tileBorderRadius,
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          },
        },
        {
          id: 'tileBorderHighlightColor',
          label: 'Border Highlight Color',
          type: 'color',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.tileBorderHighlightColor,
          description: 'Color for active tile borders during animation',
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          },
        },
        {
          id: 'animationPattern',
          label: 'Animation Pattern',
          type: 'select',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.animationPattern,
          description: 'Pattern for tile illumination during gameplay',
          options: [
            { value: 'sequential', label: 'Sequential - One by one' },
            { value: 'random', label: 'Random - Unpredictable order' },
            { value: 'waterfall', label: 'Waterfall - Column by column' },
          ],
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          },
        },
      ],
    },

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
            allowLinearGradient: true,
            allowRadialGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'background',
            imageAspectRatio: 626 / 487,
          },
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'rouletteColor1',
          label: 'Roulette Color 1',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
          },
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.rouletteColor1,
          description: 'Color for red numbers on the roulette wheel',
        },
        {
          id: 'rouletteColor2',
          label: 'Roulette Color 2',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
          },
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.rouletteColor2,
          description: 'Color for black numbers on the roulette wheel',
        },
        {
          id: 'neutralColor',
          label: 'Neutral Color (0)',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
          },
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.neutralColor,
          description: 'Color for the 0 tile (traditionally green)',
        },
        {
          id: 'textColor',
          label: 'Text Color',
          type: 'color',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.textColor,
          description: 'Color of text on tiles and UI elements',
        },
      ],
    },

    {
      id: 'animation',
      title: 'Animation Settings',
      parameters: [
        {
          id: 'spinDuration',
          label: 'Animation Duration',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.spinDuration,
          description: 'Duration of the main game animation in milliseconds',
          constraints: ROULETTE_CONSTRAINTS.spinDuration,
        },
        {
          id: 'resetDuration',
          label: 'Reset Duration',
          type: 'number',
          defaultValue: DEFAULT_ROULETTE_PARAMETERS.resetDuration,
          description: 'Duration for game to reset to starting position in milliseconds',
          constraints: ROULETTE_CONSTRAINTS.resetDuration,
        },
      ],
    },

    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.spinStart',
          label: 'Spin Start Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when spin begins',
          soundOptions: {
            soundContext: 'Spin Start'
          },
          condition: {
            param: 'layoutType',
            equals: 'spin',
          }
        },
        {
          id: 'customSounds.spinResult',
          label: 'Spin Result Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played for spin result (win/loss)',
          soundOptions: {
            soundContext: 'Spin Result'
          },
          condition: {
            param: 'layoutType',
            equals: 'spin',
          }
        },
        {
          id: 'customSounds.spinReset',
          label: 'Spin Reset Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when game resets to idle',
          soundOptions: {
            soundContext: 'Spin Reset'
          },
          condition: {
            param: 'layoutType',
            equals: 'spin',
          }
        },
        {
          id: 'customSounds.tileHighlight',
          label: 'Tile Highlight Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played for tile highlight during animation',
          soundOptions: {
            soundContext: 'Tile Highlight'
          },
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          }
        },
        {
          id: 'customSounds.tilesResult',
          label: 'Tiles Result Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played for tiles result (win/loss)',
          soundOptions: {
            soundContext: 'Tiles Result'
          },
          condition: {
            param: 'layoutType',
            equals: 'tiles',
          }
        },
      ],
    },
  ],
}

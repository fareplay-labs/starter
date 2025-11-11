// @ts-nocheck
import { type GameEditorMetadata } from '../shared/GameParameterEditor/types'
import { AppGameName } from '@/chains/types'
import {
  RPS_CONSTRAINTS,
  DEFAULT_RPS_PARAMETERS,
} from './types'

// RPS game editor metadata
export const RPS_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.RPS,
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
            imageAspectRatio: 626 / 487,
          },
          defaultValue: DEFAULT_RPS_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'useCustomIcons',
          label: 'Use Custom Icons',
          type: 'boolean',
          defaultValue: DEFAULT_RPS_PARAMETERS.useCustomIcons ?? false,
          description: 'Toggle to use your own images for hand icons',
        },
        // Custom images appear directly under the toggle
        {
          id: 'customRockImage',
          label: 'Rock Image',
          type: 'color',
          colorOptions: {
            allowSolid: false,
            allowGradient: false,
            allowAlpha: false,
            allowGradientDirection: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_RPS_PARAMETERS.customRockImage || '',
          description: 'Custom image for rock hand',
          condition: { param: 'useCustomIcons', equals: true },
        },
        {
          id: 'customPaperImage',
          label: 'Paper Image',
          type: 'color',
          colorOptions: {
            allowSolid: false,
            allowGradient: false,
            allowAlpha: false,
            allowGradientDirection: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_RPS_PARAMETERS.customPaperImage || '',
          description: 'Custom image for paper hand',
          condition: { param: 'useCustomIcons', equals: true },
        },
        {
          id: 'customScissorsImage',
          label: 'Scissors Image',
          type: 'color',
          colorOptions: {
            allowSolid: false,
            allowGradient: false,
            allowAlpha: false,
            allowGradientDirection: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_RPS_PARAMETERS.customScissorsImage || '',
          description: 'Custom image for scissors hand',
          condition: { param: 'useCustomIcons', equals: true },
        },
        {
          id: 'handSize',
          label: 'Hand Size',
          type: 'number',
          defaultValue: DEFAULT_RPS_PARAMETERS.handSize,
          description: 'Size of the hand icons in pixels',
          constraints: RPS_CONSTRAINTS.handSize,
        },
        {
          id: 'handSpacing',
          label: 'Hand Spacing',
          type: 'number',
          defaultValue: DEFAULT_RPS_PARAMETERS.handSpacing,
          description: 'Space between hands in pixels',
          constraints: RPS_CONSTRAINTS.handSpacing,
        },
        {
          id: 'showResultText',
          label: 'Show Result Text',
          type: 'boolean',
          defaultValue: DEFAULT_RPS_PARAMETERS.showResultText,
          description: 'Toggle display of WIN/LOSE/DRAW text overlay',
        },
        {
          id: 'showVsText',
          label: 'Show VS Text',
          type: 'boolean',
          defaultValue: DEFAULT_RPS_PARAMETERS.showVsText,
          description: 'Toggle display of VS text between the hands',
        },
        {
          id: 'glowEffect',
          label: 'Glow Effect',
          type: 'boolean',
          defaultValue: DEFAULT_RPS_PARAMETERS.glowEffect,
          description: 'Enable glow effects on hands',
        },
        {
          id: 'primaryColor',
          label: 'Primary Color',
          type: 'color',
          defaultValue: DEFAULT_RPS_PARAMETERS.primaryColor,
          description: 'Main color theme',
        },
        {
          id: 'secondaryColor',
          label: 'Secondary Color',
          type: 'color',
          defaultValue: DEFAULT_RPS_PARAMETERS.secondaryColor,
          description: 'Secondary color theme',
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          defaultValue: DEFAULT_RPS_PARAMETERS.winColor,
          description: 'Color for winning states',
        },
        {
          id: 'loseColor',
          label: 'Lose Color',
          type: 'color',
          defaultValue: DEFAULT_RPS_PARAMETERS.loseColor,
          description: 'Color for losing states',
        },
      ],
    },

    // Animation Settings section
    {
      id: 'animation',
      title: 'Animation Settings',
      parameters: [
        {
          id: 'animationPreset',
          label: 'Animation Style',
          type: 'select',
          defaultValue: DEFAULT_RPS_PARAMETERS.animationPreset,
          description: 'Type of animation to use for the game reveal',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'clash', label: 'Clash' },
            // { value: 'laser', label: 'Laser' }, // Disabled temporarily
          ],
        },
        {
          id: 'animationSpeed',
          label: 'Animation Speed',
          type: 'number',
          defaultValue: DEFAULT_RPS_PARAMETERS.animationSpeed,
          description: 'Total duration of the animation in milliseconds',
          constraints: RPS_CONSTRAINTS.animationSpeed,
        },
      ],
    },

    // Sound Effects section
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.beep',
          label: 'Animation Beat',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played during animation countdown beats',
          soundOptions: {
            soundContext: 'Animation Beat',
          },
        },
        {
          id: 'customSounds.impact',
          label: 'Clash Impact',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when hands clash (clash animation)',
          soundOptions: {
            soundContext: 'Clash Impact',
          },
        },
        {
          id: 'customSounds.gameWin',
          label: 'Win Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player wins',
          soundOptions: {
            soundContext: 'Game Win',
          },
        },
        {
          id: 'customSounds.gameLoss',
          label: 'Loss Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player loses',
          soundOptions: {
            soundContext: 'Game Loss',
          },
        },
        {
          id: 'customSounds.gameDraw',
          label: 'Draw Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when game is a draw',
          soundOptions: {
            soundContext: 'Game Draw',
          },
        },
      ],
    },
  ],
}

// @ts-nocheck
import { type GameEditorMetadata } from '../shared/GameParameterEditor/types'
import { AppGameName } from '@/chains/types'
import {
  DICE_CONSTRAINTS,
  DEFAULT_DICE_PARAMETERS,
  // type DiceAnimationPreset, // No longer needed here
  // type DiceModelType, // No longer needed here
} from './types'

// Dice game editor metadata
export const DICE_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Dice,
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
          defaultValue: DEFAULT_DICE_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'diceModel',
          label: 'Dice Model',
          type: 'select',
          defaultValue: DEFAULT_DICE_PARAMETERS.diceModel,
          description: 'Visual style of the dice',
          options: [
            { value: 'wireframe', label: 'Wireframe' },
            { value: 'solid', label: 'Solid' },
            { value: 'neon', label: 'Neon' },
            { value: 'custom', label: 'Custom' },
          ],
        },
        {
          id: 'diceColor',
          label: 'Dice Color',
          type: 'color',
          defaultValue: DEFAULT_DICE_PARAMETERS.diceColor,
          description: 'Color of the dice',
          colorOptions: {
            allowGradient: false,
            allowAlpha: false,
            allowImage: false,
            allowAIGen: false,
          },
          condition: {
            param: 'diceModel',
            notEquals: 'custom',
          },
        },
        {
          id: 'diceImage',
          label: 'Dice Image',
          type: 'color',
          defaultValue: DEFAULT_DICE_PARAMETERS.diceImage,
          description: 'Upload a custom image for your dice',
          colorOptions: {
            allowGradient: false,
            allowAlpha: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'asset',
            imageAspectRatio: 1,
          },
          condition: {
            param: 'diceModel',
            equals: 'custom',
          },
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          defaultValue: DEFAULT_DICE_PARAMETERS.winColor,
          description: 'Color for winning states',
        },
        {
          id: 'loseColor',
          label: 'Lose Color',
          type: 'color',
          defaultValue: DEFAULT_DICE_PARAMETERS.loseColor,
          description: 'Color for losing states',
        },
        {
          id: 'diceSize',
          label: 'Dice Size',
          type: 'number',
          defaultValue: DEFAULT_DICE_PARAMETERS.diceSize,
          description: 'Size of the dice in pixels',
          constraints: DICE_CONSTRAINTS.diceSize,
        },
      ],
    },

    // Animation Settings section
    {
      id: 'animation',
      title: 'Animation Settings',
      parameters: [
        {
          id: 'animationSpeed',
          label: 'Animation Speed',
          type: 'number',
          defaultValue: DEFAULT_DICE_PARAMETERS.animationSpeed, // Corrected default
          description: 'Duration of animations in milliseconds',
          constraints: DICE_CONSTRAINTS.animationSpeed,
        },
        {
          id: 'animationPreset',
          label: 'Animation Style',
          type: 'select',
          defaultValue: DEFAULT_DICE_PARAMETERS.animationPreset,
          description: 'Type of animation to use for rolls',
          options: [
            { value: 'simple', label: 'Simple' },
            { value: 'thump', label: 'Thump' },
            { value: 'spin', label: 'Spin' },
          ],
        },
      ],
    },

    // Sound Effects section
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.rollStart',
          label: 'Dice Roll Start',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when dice starts rolling',
          soundOptions: {
            soundContext: 'Dice Roll Start',
          },
        },
        {
          id: 'customSounds.diceWin',
          label: 'Win Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player wins',
          soundOptions: {
            soundContext: 'Dice Win',
          },
        },
        {
          id: 'customSounds.diceLoss',
          label: 'Loss Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player loses',
          soundOptions: {
            soundContext: 'Dice Loss',
          },
        },
      ],
    },
  ],
}

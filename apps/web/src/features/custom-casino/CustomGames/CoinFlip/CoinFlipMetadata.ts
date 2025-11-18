// @ts-nocheck
import { type GameEditorMetadata } from '@/features/custom-casino/CustomGames/shared/GameParameterEditor/types'
import { AppGameName } from '@/chains/types'
import { COINFLIP_CONSTRAINTS } from './types'

export const COINFLIP_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.CoinFlip,
  sections: [
    {
      id: 'visual',
      title: 'Visual Settings',
      parameters: [
        {
          id: 'background',
          label: 'Background',
          type: 'color',
          description: 'Main game background color or image',
          defaultValue: '#1a1a1a',
          colorOptions: {
            allowGradient: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'background',
          },
        },
        {
          id: 'coinColor',
          label: 'Coin Color',
          type: 'color',
          description: 'Color of the coin edge',
          defaultValue: '#FFD700',
        },
        {
          id: 'coinSize',
          label: 'Coin Size',
          type: 'number',
          description: 'Relative size of the coin',
          defaultValue: 120,
          constraints: COINFLIP_CONSTRAINTS.coinSize,
        },
      ],
    },
    {
      id: 'faces',
      title: 'Coin Faces',
      parameters: [
        {
          id: 'headsCustomImage',
          label: 'Heads Image',
          type: 'color',
          description: 'Custom image for heads side',
          defaultValue: '',
          colorOptions: {
            allowSolid: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
            cropShape: 'round',
          },
        },
        {
          id: 'tailsCustomImage',
          label: 'Tails Image',
          type: 'color',
          description: 'Custom image for tails side',
          defaultValue: '',
          colorOptions: {
            allowSolid: false,
            allowImage: true,
            allowAIGen: true,
            imageType: 'icon',
            imageAspectRatio: 1,
            cropShape: 'round',
          },
        },
      ],
    },
    {
      id: 'animation',
      title: 'Animation Settings',
      parameters: [
        {
          id: 'animationDuration',
          label: 'Animation Duration',
          type: 'number',
          description: 'Duration of coin flip animation in milliseconds',
          defaultValue: 1200,
          constraints: COINFLIP_CONSTRAINTS.animationDuration,
        },
        {
          id: 'animationPreset',
          label: 'Animation Style',
          type: 'select',
          description: 'Type of coin animation',
          defaultValue: 'spin',
          options: [
            { value: 'spin', label: 'Spin' },
            { value: 'flip', label: 'Flip' },
            { value: 'twist', label: 'Twist' },
          ],
        },
        {
          id: 'flipCount',
          label: 'Flip Count',
          type: 'number',
          description: 'Number of flips in animation',
          defaultValue: 5,
          constraints: COINFLIP_CONSTRAINTS.flipCount,
        },
      ],
    },
    {
      id: 'effects',
      title: 'Effects & Colors',
      parameters: [
        {
          id: 'glowEffect',
          label: 'Glow Effect',
          type: 'boolean',
          description: 'Show glow effect around coin',
          defaultValue: true,
        },
        {
          id: 'particleEffects',
          label: 'Particle Effects',
          type: 'select',
          description: 'Level of particle effects',
          defaultValue: 'less',
          options: [
            { value: 'none', label: 'None' },
            { value: 'less', label: 'Less' },
            { value: 'more', label: 'More' },
          ],
        },
        {
          id: 'particleCount',
          label: 'Particle Count',
          type: 'number',
          description: 'Number of particles emitted on win',
          defaultValue: 32,
          constraints: {
            min: 0,
            max: 128,
            step: 4,
          },
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          description: 'Color for winning outcome',
          defaultValue: '#4CAF50',
        },
        {
          id: 'lossColor',
          label: 'Loss Color',
          type: 'color',
          description: 'Color for losing outcome',
          defaultValue: '#f44336',
        },
        {
          id: 'borderColor',
          label: 'Border Color',
          type: 'color',
          description: 'Color of UI borders',
          defaultValue: '#333333',
        },
        {
          id: 'textColor',
          label: 'Text Color',
          type: 'color',
          description: 'Color of text elements',
          defaultValue: '#ffffff',
        },
      ],
    },

    // Sound Effects section
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.coinFlip',
          label: 'Coin Flip Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when the coin is flipped',
          soundOptions: {
            soundContext: 'Coin Flip'
          }
        },
        {
          id: 'customSounds.gameWin',
          label: 'Win Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when winning the game',
          soundOptions: {
            soundContext: 'Game Win'
          }
        },
        {
          id: 'customSounds.gameLoss',
          label: 'Loss Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when losing the game',
          soundOptions: {
            soundContext: 'Game Loss'
          }
        },
      ],
    },
  ],
}

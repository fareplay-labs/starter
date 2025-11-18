// @ts-nocheck
import { AppGameName } from '@/chains/types'
import { type GameEditorMetadata } from '../../shared/GameParameterEditor'
import { DEFAULT_PLINKO_PARAMETERS, PLINKO_CONSTRAINTS } from '../types'

export const PLINKO_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Plinko,
  sections: [
    {
      id: 'settings',
      title: 'Game Settings',
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
          defaultValue: DEFAULT_PLINKO_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'ballColor',
          label: 'Ball Color',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowLinearGradient: false,
            allowRadialGradient: true,
          },
          defaultValue: DEFAULT_PLINKO_PARAMETERS.ballColor,
          description: 'Color of the balls during animation',
        },
        {
          id: 'gameSize',
          label: 'Game Size',
          type: 'number',
          constraints: PLINKO_CONSTRAINTS.gameSize,
          defaultValue: DEFAULT_PLINKO_PARAMETERS.gameSize,
          description: 'Size of the game board relative to container',
        },
        {
          id: 'ballTrail',
          label: 'Ball Trails',
          type: 'boolean',
          defaultValue: DEFAULT_PLINKO_PARAMETERS.ballTrail,
          description: 'Enable trailing effects behind moving balls',
        },
        {
          id: 'ballDropDelay',
          label: 'Ball Drop Delay',
          type: 'number',
          constraints: PLINKO_CONSTRAINTS.ballDropDelay,
          defaultValue: DEFAULT_PLINKO_PARAMETERS.ballDropDelay,
          description: 'Time in milliseconds between ball drops (lower = faster)',
        },
        {
          id: 'pegColor',
          label: 'Peg Color',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowRadialGradient: true,
          },
          defaultValue: DEFAULT_PLINKO_PARAMETERS.pegColor,
          description: 'Color of the pegs that balls bounce off',
        },
        {
          id: 'bucketColor',
          label: 'Bucket Color',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowRadialGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'tile',
            imageAspectRatio: 4,
          },
          defaultValue: DEFAULT_PLINKO_PARAMETERS.bucketColor,
          description: 'Fill color/texture of the buckets',
        },
        {
          id: 'bucketOutlineColor',
          label: 'Bucket Outline',
          type: 'color',
          colorOptions: {
            allowAlpha: true,
          },
          defaultValue: DEFAULT_PLINKO_PARAMETERS.bucketOutlineColor,
          description: 'Color of the outline that appears when a ball hits a bucket',
        },
        {
          id: 'showBucketAnimations',
          label: 'Bucket Animations',
          type: 'boolean',
          defaultValue: DEFAULT_PLINKO_PARAMETERS.showBucketAnimations,
          description: 'Enable bouncing animations when balls hit buckets',
        },
        {
          id: 'multiplierColor',
          label: 'Multiplier Text',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowLinearGradient: false,
            allowRadialGradient: true,
            allowAlpha: true,
          },
          defaultValue: DEFAULT_PLINKO_PARAMETERS.multiplierColor,
          description:
            'Color of multiplier text below buckets. Radial gradients apply from center outward.',
        },
      ],
    },
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.ballDrop',
          label: 'Ball Drop Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when a ball is dropped',
          soundOptions: {
            soundContext: 'Ball Drop'
          }
        },
        {
          id: 'customSounds.bucketLanding',
          label: 'Bucket Landing Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when a ball lands in a bucket',
          soundOptions: {
            soundContext: 'Bucket Landing'
          }
        },
      ],
    },
  ],
}

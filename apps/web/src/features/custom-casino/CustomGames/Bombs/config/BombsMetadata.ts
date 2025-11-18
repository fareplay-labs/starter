// @ts-nocheck
import { AppGameName } from '@/chains/types'
import { type GameEditorMetadata } from '../../shared/GameParameterEditor'
import { BOMBS_CONSTRAINTS, DEFAULT_BOMBS_PARAMETERS } from '../types'

export const BOMBS_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.Bombs,
  sections: [
    {
      id: 'layout',
      title: 'Layout Settings',
      parameters: [
        {
          id: 'tileShape',
          label: 'Tile Shape',
          type: 'select',
          options: [
            { value: 'square', label: 'Square' },
            { value: 'round', label: 'Round' },
          ],
          defaultValue: DEFAULT_BOMBS_PARAMETERS.tileShape,
          description: 'Shape of the tiles',
        },
        {
          id: 'tileSize',
          label: 'Tile Size',
          type: 'number',
          constraints: {
            min: BOMBS_CONSTRAINTS.tileSize.min,
            max: 75,
            step: BOMBS_CONSTRAINTS.tileSize.step,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.tileSize,
          description: 'Size of the tiles',
        },
        {
          id: 'tileSpacing',
          label: 'Tile Spacing',
          type: 'number',
          constraints: {
            min: BOMBS_CONSTRAINTS.tileSpacing.min,
            max: BOMBS_CONSTRAINTS.tileSpacing.max,
            step: BOMBS_CONSTRAINTS.tileSpacing.step,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.tileSpacing,
          description: 'Spacing between tiles',
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
            allowGradientDirection: true,
            allowLinearGradient: true,
            allowRadialGradient: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'background',
            imageAspectRatio: 626 / 487,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'tileColor',
          label: 'Default Tile',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'tile',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.tileColor,
          description: 'Default appearance of unselected tiles',
        },
        {
          id: 'selectedTileColor',
          label: 'Selected Tile',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'tile',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.selectedTileColor,
          description: 'Appearance of selected tiles',
        },
        {
          id: 'bombColor',
          label: 'Bomb Tile',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'tile',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.bombColor,
          description: 'Appearance of revealed bomb tiles',
        },
        {
          id: 'safeColor',
          label: 'Safe Tile',
          type: 'color',
          colorOptions: {
            allowGradient: true,
            allowGradientDirection: true,
            allowImage: true,
            allowAIGen: true,
            imageType: 'tile',
            imageAspectRatio: 1,
          },
          defaultValue: DEFAULT_BOMBS_PARAMETERS.safeColor,
          description: 'Appearance of revealed safe tiles',
        },
        {
          id: 'borderColor',
          label: 'Default Tile Border Color',
          type: 'color',
          defaultValue: DEFAULT_BOMBS_PARAMETERS.borderColor,
          description: 'Default border color around each tile',
        },
        {
          id: 'selectedBorderColor',
          label: 'Selected Tile Border Color',
          type: 'color',
          defaultValue: DEFAULT_BOMBS_PARAMETERS.selectedBorderColor,
          description: 'Border color for selected tiles',
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          defaultValue: DEFAULT_BOMBS_PARAMETERS.winColor,
          description: 'Border color for winning tiles and final state',
        },
        {
          id: 'lossColor',
          label: 'Loss Color',
          type: 'color',
          defaultValue: DEFAULT_BOMBS_PARAMETERS.lossColor,
          description: 'Border color for losing tiles and final state',
        },
        {
          id: 'particleEffects',
          label: 'Particle Effects',
          type: 'select',
          options: [
            { value: 'none', label: 'None' },
            { value: 'less', label: 'Less' },
            { value: 'more', label: 'More' },
          ],
          defaultValue: DEFAULT_BOMBS_PARAMETERS.particleEffects,
          description: 'Level of particle effects when revealing tiles',
        },
      ],
    },
    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.tileClick',
          label: 'Tile Click Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when clicking tiles',
          soundOptions: {
            soundContext: 'Tile Click'
          }
        },
        {
          id: 'customSounds.coinReveal',
          label: 'Coin Reveal Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when revealing safe tiles',
          soundOptions: {
            soundContext: 'Coin Reveal'
          }
        },
        {
          id: 'customSounds.bombExplosion',
          label: 'Bomb Explosion Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when hitting a bomb',
          soundOptions: {
            soundContext: 'Bomb Explosion'
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

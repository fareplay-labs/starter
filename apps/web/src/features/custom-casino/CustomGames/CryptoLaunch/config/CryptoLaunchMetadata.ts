// @ts-nocheck
import { AppGameName } from '@/chains/types'
import { type GameEditorMetadata } from '../../shared/GameParameterEditor'
import { CRYPTO_LAUNCH_CONSTRAINTS, DEFAULT_CRYPTO_LAUNCH_PARAMETERS } from '../types'

export const CRYPTO_LAUNCH_EDITOR_METADATA: GameEditorMetadata = {
  gameType: AppGameName.CryptoLaunch_1,
  sections: [
    {
      id: 'visual_settings',
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
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.background.url,
          description: 'Background of the game area',
        },
        {
          id: 'chartColor',
          label: 'Chart Line Color',
          type: 'color',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.chartColor,
          description: 'Color of the price line',
        },
        {
          id: 'winColor',
          label: 'Win Color',
          type: 'color',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.winColor,
          description: 'Color for win area highlight and sparks',
        },
        {
          id: 'highlightOpacity',
          label: 'Win Highlight Opacity',
          type: 'number',
          constraints: {
            min: CRYPTO_LAUNCH_CONSTRAINTS.highlightOpacity.min,
            max: CRYPTO_LAUNCH_CONSTRAINTS.highlightOpacity.max,
            step: CRYPTO_LAUNCH_CONSTRAINTS.highlightOpacity.step,
          },
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.highlightOpacity,
          description: 'Opacity of win area overlay (0-1)',
        },
        {
          id: 'animationDuration',
          label: 'Total Animation Duration (ms)',
          type: 'number',
          constraints: {
            min: CRYPTO_LAUNCH_CONSTRAINTS.animationDuration.min,
            max: CRYPTO_LAUNCH_CONSTRAINTS.animationDuration.max,
            step: CRYPTO_LAUNCH_CONSTRAINTS.animationDuration.step,
          },
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.animationDuration,
          description: 'Total time of the full 365-day simulation (lower = faster)',
        },
        {
          id: 'showXAxis',
          label: 'Show X-Axis Grid',
          type: 'boolean',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.showXAxis,
          description: 'Toggle visibility of x-axis grid lines & labels',
        },
        {
          id: 'showDayLabels',
          label: 'Show Day Labels',
          type: 'boolean',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.showDayLabels,
          description: 'Toggle visibility of Start/End day labels',
        },
        {
          id: 'showGrid',
          label: 'Show Grid Lines',
          type: 'boolean',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.showGrid,
          description: 'Toggle visibility of all grid lines',
        },
        {
          id: 'gridColor',
          label: 'Grid Line Color',
          type: 'color',
          colorOptions: {
            allowGradient: false,
            allowAlpha: true,
            allowImage: false,
            allowAIGen: false,
          },
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.gridColor,
          description: 'Color of grid lines',
          condition: { param: 'showGrid', equals: true },
        },
        {
          id: 'textColor',
          label: 'Text Color',
          type: 'color',
          defaultValue: DEFAULT_CRYPTO_LAUNCH_PARAMETERS.textColor,
          description: 'Color used for chart labels and text',
        },
      ],
    },

    {
      id: 'sounds',
      title: 'Sound Effects',
      parameters: [
        {
          id: 'customSounds.gameStart',
          label: 'Game Start Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when game animation begins',
          soundOptions: {
            soundContext: 'Game Start'
          }
        },
        {
          id: 'customSounds.positiveBeep',
          label: 'Positive Beep Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when price crosses above sell line during sell window',
          soundOptions: {
            soundContext: 'Positive Crossing'
          }
        },
        {
          id: 'customSounds.negativeBeep',
          label: 'Negative Beep Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when price crosses below sell line during sell window',
          soundOptions: {
            soundContext: 'Negative Crossing'
          }
        },
        {
          id: 'customSounds.win',
          label: 'Win Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player wins (sold above minimum price)',
          soundOptions: {
            soundContext: 'Game Win'
          }
        },
        {
          id: 'customSounds.loss',
          label: 'Loss Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played when player loses (sold below minimum price or no sale)',
          soundOptions: {
            soundContext: 'Game Loss'
          }
        },
        {
          id: 'customSounds.winningLoop',
          label: 'Winning Loop Sound',
          type: 'sound',
          defaultValue: undefined,
          description: 'Sound played on loop while price is above min sell line in sell window (defaults to coin sound)',
          soundOptions: {
            soundContext: 'Winning State'
          }
        },
      ],
    },
  ],
}

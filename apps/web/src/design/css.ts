import { css } from 'styled-components'
import { BACKGROUND_COLORS, BORDER_COLORS } from './colors'

export const floatingContainer = css`
  border: 1px solid ${BORDER_COLORS.one};
  backdrop-filter: blur(2px);
  background: ${BACKGROUND_COLORS.two};
  overflow: hidden;

  /* Vendor prefixes */
  -webkit-backdrop-filter: blur(2px); /* Safari and Chrome */
  -moz-backdrop-filter: blur(2px); /* Firefox */
  -ms-backdrop-filter: blur(2px); /* Edge */

  &.solid-color {
    background: ${BACKGROUND_COLORS.one};
  }
`

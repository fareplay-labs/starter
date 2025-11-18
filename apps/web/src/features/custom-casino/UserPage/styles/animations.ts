// @ts-nocheck
import { keyframes } from 'styled-components'

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

export const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
`

export const expandHeight = keyframes`
  from {
    max-height: 80px;
    overflow: hidden;
  }
  to {
    max-height: 220px;
    overflow: visible;
  }
`

export const collapseHeight = keyframes`
  from {
    max-height: 220px;
    overflow: hidden;
  }
  to {
    max-height: 80px;
    overflow: hidden;
  }
`

// Border animations have been moved to FancyBorders library

import { motion } from 'framer-motion'
import { styled } from 'styled-components'
import { BREAKPOINTS, SPACING } from '@/design/spacing'

export const PageWrapper = styled(motion.div)`
  height: 100%;
  width: 100%;
  max-width: 1000px;
  overflow-x: hidden;
  margin: auto;
  justify-content: space-between;
  align-items: flex-start;
  display: inline-flex;
  box-sizing: border-box;

  &.custom-casino {
    max-width: 100%;
  }

  @media only screen and (max-width: ${BREAKPOINTS.lg}px) {
    grid-column: 1 / span 2;
  }

  @media (min-aspect-ratio: 16/9) and (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    display: flex;
    flex-direction: row;
  }
`

export const FloatingContainer = styled(motion.div)`
  margin: ${SPACING.md}px;
  display: grid;
  gap: ${SPACING.md}px;
  border-radius: 6px;

  grid-template-rows: 1fr;
  grid-template-columns: 4fr 2fr;

  height: calc(100% - ${SPACING.md * 2}px);
  width: 100%;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
    flex-direction: column;
    margin: 0px;
    height: 100%;
  }

  @media (min-aspect-ratio: 16/9) and (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    flex-direction: row;
  }
`

export const LeftContainer = styled.div`
  display: grid;
  grid-template-rows: 485px minmax(0, 1fr);
  grid-gap: ${SPACING.md}px;
  grid-row: 1 / span 2;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
  }
`

export const RightContainer = styled.div`
  display: grid;
  grid-column: 2 / span 2;
  grid-row: 1 / span 2;
  grid-auto-rows: auto;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    flex-grow: 1;
    display: flex;
    overflow-y: auto;
    scroll-behavior: smooth;
  }
`

export const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  height: 90svh;

  @media (min-aspect-ratio: 16/9) and (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    height: 100svh;
    align-items: center;
  }
`

export const ScrollItem = styled.div`
  flex: 0 0 100%;
  scroll-snap-align: start;
  height: 100%;
  width: 80%;
  box-sizing: border-box;
  padding-top: 0px;
  padding: ${SPACING.md}px;

  @media only screen and (max-width: ${BREAKPOINTS.sm}px) {
    height: 100%;
  }

  @media (min-aspect-ratio: 16/9) and (max-width: ${BREAKPOINTS.sm}px) and (orientation: landscape) {
    height: 100svh;
    align-items: center;
  }
`

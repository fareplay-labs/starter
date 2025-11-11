// @ts-nocheck
import { styled } from 'styled-components'
import { BREAKPOINTS, SPACING, TEXT_COLORS } from '@/design'

export const SUserPage = styled.div`
  width: 95%;
  min-height: 100vh;
  color: ${TEXT_COLORS.one};
  padding: 0px;
  padding-top: ${SPACING.md}px;
  justify-content: center;
  display: grid;
  grid-template-columns: auto 4fr;
  gap: ${SPACING.lg}px;
  margin: 0 auto;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
  }
`

export const SContent = styled.div`
  width: 100%;
  min-width: 0;
  max-width: 100vw;
  margin: 0 auto;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    max-width: 100%;
  }
`

export const SHeroLayout = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: ${SPACING.xl}px;
`

export const SHeroMainContent = styled.div`
  width: 100%;
`

// Create a styled container with font-family that will wrap the entire page
export const SPageContainer = styled.div<{ $fontFamily: string }>`
  font-family: ${({ $fontFamily }) => $fontFamily} !important;
  height: calc(100% - ${SPACING.xl}px);
  overflow-y: scroll;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    min-height: calc(100% - ${SPACING.xl}px);
    margin: 0 auto;
  }

  /* Apply font to all elements within the container */
  * {
    font-family: inherit !important;
  }

  /* Set CSS custom property for font-family */
  &:root {
    --app-font-family: ${({ $fontFamily }) => $fontFamily};
  }

  /* Force child elements to inherit font regardless of their own styling */
  button,
  input,
  textarea,
  select,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  span,
  div,
  a {
    font-family: inherit !important;
  }

  /* Target specific problematic elements */
  .game-card,
  .section-title,
  .modal-content,
  .user-hero {
    font-family: inherit !important;
  }
`

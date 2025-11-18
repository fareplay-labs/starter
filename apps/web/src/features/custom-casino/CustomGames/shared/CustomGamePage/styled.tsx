// @ts-nocheck
import { styled, keyframes, css } from 'styled-components'
import { BACKGROUND_COLORS, BORDER_COLORS, BREAKPOINTS, floatingContainer } from '@/design'

// CUSTOM GAME PAGE STYLING
// Main container for the game page
export const SGamePageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 32px);
  max-width: 1280px;
  margin: 0 auto;
  padding: 15px;
  position: relative;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    padding: 0px;
  }
`

// Container for the three-panel layout below the banner
export const SThreePanelContainer = styled.div<{ $isExpanded?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isExpanded }) => ($isExpanded ? '320px 1fr 1fr' : '60px 5fr 2fr')};
  grid-template-rows: 2fr 1fr;
  grid-template-areas: ${({ $isExpanded }) => {
    if ($isExpanded) {
      return '"left middle middle" "left right bottom"'
    }
    return '"left middle right" "left bottom bottom"'
  }};
  width: 100%;
  margin-top: 15px;
  gap: 8px;
  position: relative;
  max-height: calc(100vh - 230px);
  transition:
    grid-template-columns 0.3s ease-in-out,
    grid-template-rows 0.3s ease-in-out;

  @media (max-width: 1600px) {
    grid-template-columns: ${({ $isExpanded }) => ($isExpanded ? '320px 1fr 1fr' : '60px 4fr 2fr')};
  }

  @media (max-width: ${BREAKPOINTS.md}px) {
    grid-template-rows: 2fr 1fr;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0;
    max-height: calc(100vh - 70px);
  }
`

// Left panel for editor
export const SLeftPanel = styled.div<{ $isExpanded?: boolean }>`
  grid-area: left;
  position: relative;
  width: ${({ $isExpanded }) => ($isExpanded ? '100%' : '10%')};
  min-width: 60px;
  max-width: 320px;
  height: 100%;
  min-height: 485px;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-start;
  transition:
    width 0.3s ease-in-out,
    min-height 0.3s ease-in-out;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: unset;
    max-height: none;
    position: static;
    top: unset;
    left: unset;
    z-index: unset;
  }
`

// Middle panel for game
export const SMiddlePanel = styled.div<{ $isExpanded?: boolean }>`
  grid-area: middle;
  width: 100%;
  height: 100%;
  aspect-ratio: 624/485;
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  background: ${BACKGROUND_COLORS.two};
  ${floatingContainer}
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition:
    height 0.3s ease-in-out,
    aspect-ratio 0.3s ease-in-out,
    width 0.3s,
    min-width 0.3s,
    max-width 0.3s;

  @media (max-width: ${BREAKPOINTS.lg}px) {
    aspect-ratio: 4/3;
    min-width: 0;
    max-width: 100%;
  }

  @media (max-width: ${BREAKPOINTS.md}px) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    aspect-ratio: 1/1;
    min-height: 33svh;
    position: static;
    top: unset;
    left: unset;
  }

  @media (max-width: ${BREAKPOINTS.sm}px) {
    min-width: 0;
    max-width: 100vw;
    height: 220px;
    aspect-ratio: 1/1;
    position: static;
    top: unset;
    left: unset;
  }
`

// Right panel for form
export const SRightPanel = styled.div<{ $isExpanded?: boolean }>`
  grid-area: right;
  width: 100%;
  max-height: calc(100vh - 260px);
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  background: ${BACKGROUND_COLORS.two};
  ${floatingContainer}
  overflow: auto;
  padding: 12px 12px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  transition:
    width 0.3s ease-in-out,
    height 0.3s ease-in-out,
    min-height 0.3s ease-in-out,
    max-height 0.3s ease-in-out;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: ${({ $isExpanded }) => ($isExpanded ? 'none' : 'flex')};
    min-height: 30svh;
  }

  /* Add some spacing between form elements */
  > * {
    margin-bottom: 12px;
  }

  /* Remove margin from last child */
  > *:last-child {
    margin-bottom: 0;
  }
`

// Bottom panels container
export const SBottomPanelsContainer = styled.div<{ $isExpanded?: boolean }>`
  display: grid;
  grid-area: bottom;
  grid-template-columns: ${({ $isExpanded }) => ($isExpanded ? '1fr' : '1fr 1fr')};
  gap: 8px;
  box-sizing: border-box;
  overflow: auto;
  user-select: none;
`

// Bottom Left panel for Bet History
export const SBottomLeftPanel = styled.div<{ $isExpanded?: boolean }>`
  width: 100%;
  min-height: 200px;
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  background: ${BACKGROUND_COLORS.two};
  ${floatingContainer}
  overflow: auto;
  padding: 12px 12px 15px;
  box-sizing: border-box;
  flex-direction: column;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: ${({ $isExpanded }) => ($isExpanded ? 'none' : 'flex')};
    min-height: 22svh;
  }
`

// Bottom right panel for Game rules
export const SBottomRightPanel = styled.div<{ $isExpanded?: boolean }>`
  width: 100%;
  min-height: 200px;
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  background: ${BACKGROUND_COLORS.two};
  ${floatingContainer}
  overflow: auto;
  padding: 12px 12px 15px;
  box-sizing: border-box;
  flex-direction: column;
  display: ${({ $isExpanded }) => ($isExpanded ? 'none' : 'flex')};

  @media (max-width: ${BREAKPOINTS.sm}px) {
    display: ${({ $isExpanded }) => ($isExpanded ? 'none' : 'flex')};
    min-height: 22svh;
  }
`

// Containers within the bottom and right panels
export const SPanelContentContainer = styled.div`
  width: 100%;
  align-self: flex-start;
  padding-bottom: 5px;
`

// EDIT PANEL STYLING
// Animation keyframes for config panel
export const panelExpand = keyframes`
  from {
    width: 60px;
    height: 60px;
  }
  to {
    width: 320px;
    /* Use min-height/max-height for flexible height based on content */
    min-height: 460px;
    max-height: calc(100vh - 230px);
  }
`

export const panelCollapse = keyframes`
  0% {
    width: 320px;
    min-height: 460px;
    max-height: calc(100vh - 230px);
  }
  50% {
    width: 320px;
    height: 60px;
    opacity: 0.5;
  }
  100% {
    width: 60px;
    height: 60px;
    opacity: 1;
  }
`

export const contentFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const contentFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`
// Editor panel styling
export const SEditorPanel = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  right: 0;
  top: 0;
  width: ${props => (props.$isExpanded ? '320px' : '60px')};
  height: ${props => (props.$isExpanded ? '100%' : '60px')};
  min-height: ${props => (props.$isExpanded ? '460px' : '60px')};
  max-height: ${props => (props.$isExpanded ? 'calc(100vh - 230px)' : '60px')};
  background: rgba(20, 20, 22, 0.95);
  border: 1px solid ${props => (props.$isExpanded ? BORDER_COLORS.one : 'transparent')};
  border-radius: 12px;
  overflow: hidden;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  animation: ${props =>
    props.$isExpanded ?
      css`
        ${panelExpand} 0.3s ease-in-out forwards
      `
    : css`
        ${panelCollapse} 0.3s ease-in-out forwards
      `};
  transform-origin: right top;
  transition:
    border-color 0.3s ease-in-out,
    height 0.2s ease-in-out,
    min-height 0.2s ease-in-out,
    max-height 0.2s ease-in-out;

  @media (max-width: ${BREAKPOINTS.sm}px) {
    left: 0;
    top: 240px;
    ${props => (props.$isExpanded ? 'min-width: 90svw;' : 'min-width: 60px;')}
  }
`

// Button container - always in the top right corner
export const SEditorButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 50;
`

// Panel content container
export const SEditorContent = styled.div<{ $isVisible: boolean }>`
  width: 100%;
  height: 100%;
  min-height: ${props => (props.$isVisible ? '460px' : '60px')};
  max-height: ${props => (props.$isVisible ? 'calc(100vh - 230px)' : '60px')};
  padding: 15px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  animation: ${props =>
    props.$isVisible ?
      css`
        ${contentFadeIn} 0.3s ease-in-out forwards 0.1s
      `
    : css`
        ${contentFadeOut} 0.2s ease-in-out forwards
      `};
  overflow-y: auto;
  visibility: ${props => (props.$isVisible ? 'visible' : 'hidden')};
  transition:
    opacity 0.3s ease-in-out,
    visibility 0.3s ease-in-out;

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 15px;
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Improved scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(95, 95, 255, 0.2);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(95, 95, 255, 0.3);
  }

  /* Hide scrollbar when not hovering */
  &:not(:hover)::-webkit-scrollbar-thumb {
    background: transparent;
  }
`

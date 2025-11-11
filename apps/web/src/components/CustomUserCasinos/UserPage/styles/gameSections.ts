// @ts-nocheck
import { styled } from 'styled-components'
import { SPACING } from '@/design'

export const SSection = styled.section`
  margin: ${SPACING.xl}px 0;
  position: relative;
  background: transparent;
  padding-top: ${SPACING.xl}px;
`

export const GameTileContainer = styled.div<{ $layout?: string }>`
  position: relative;
  overflow: visible;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 140px;
  margin: 0 ${SPACING.xs}px;
  flex: 0 0 auto;
  padding-bottom: ${({ $layout }) => ($layout === 'smallTiles' ? '24px' : '0')};
`

// @ts-nocheck
import { BACKGROUND_COLORS, BORDER_COLORS, SPACING, TEXT_COLORS } from '@/design'

export const SAnalyticsPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg}px;
  margin-top: ${SPACING.sm}px;
  width: 100%;
  padding-inline: ${SPACING.md}px;
`

export const SAnalyticsPageHeader = styled.div<{ $bgImage: string }>`
  position: relative;
  margin-bottom: 0px;
  border: 1px solid ${BORDER_COLORS.one};
  border-radius: 8px;
  min-height: 120px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${props => props.$bgImage});
    background-size: cover;
    background-position: center;
    opacity: 0.3;
    z-index: 0;
    border-radius: 8px;
  }

  h1 {
    position: relative;
    line-height: 1.2;
    z-index: 1;
    color: ${TEXT_COLORS.one};
    font-size: 36px;
    font-weight: 600;
    text-align: center;
  }
`
export const SAnalyticSelectionWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${SPACING.md}px;
  display: flex;
  align-items: center;

  label {
    text-wrap: nowrap;
    width: 100%;
    text-align: center;
  }

  select {
    background: ${BACKGROUND_COLORS.one};
    border: 1px solid ${BORDER_COLORS.one};
    border-radius: 8px;
    padding: ${SPACING.sm}px;
    color: ${TEXT_COLORS.one};
    z-index: 10;
    position: relative;
    width: 100%;
  }

  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
  }
`

export const SAnylyticsGridWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${SPACING.md}px;

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export const STile = styled.button<{ $color: string }>`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm}px;
  background: transparent;
  border: 1px solid ${props => props.$color};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  color: ${TEXT_COLORS.one};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  min-height: 120px;

  span {
    font-size: 14px;
    font-weight: 400;
    color: ${TEXT_COLORS.two};
  }
`

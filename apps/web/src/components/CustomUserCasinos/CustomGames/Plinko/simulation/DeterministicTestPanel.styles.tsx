// @ts-nocheck
// import { keyframes, css } from '@emotion/react'
import {
  BACKGROUND_COLORS,
  BORDER_COLORS,
  COLORS,
  FARE_COLORS,
  MENU_COLORS,
  TEXT_COLORS,
} from '@/design/colors'
import { SPACING } from '@/design/spacing'

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`

export const STestPanelContainer = styled.div`
  padding: ${SPACING.md}px;
  background: linear-gradient(
    135deg,
    ${BACKGROUND_COLORS.one} 0%,
    ${MENU_COLORS.plinko.two}40 50%,
    ${BACKGROUND_COLORS.one} 100%
  );
  color: ${TEXT_COLORS.one};
  border-radius: 8px;
  height: 100%;
  overflow-y: auto;
  border: 1px solid ${MENU_COLORS.plinko.one}30;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`

export const SHeaderSection = styled.div`
  margin-bottom: ${SPACING.md}px;
`

export const SHeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs}px;
  margin-bottom: ${SPACING.xs}px;
`

export const SHeaderIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, ${MENU_COLORS.plinko.one}, ${FARE_COLORS.pink});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`

export const SHeaderTextContainer = styled.div``

export const STitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  background: linear-gradient(90deg, ${MENU_COLORS.plinko.one}, ${FARE_COLORS.pink});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
`

export const SSubtitle = styled.p`
  color: ${TEXT_COLORS.two};
  font-size: 12px;
  margin: 0;
`

export const SPlayAllProgress = styled.div`
  margin-top: ${SPACING.xs}px;
  padding: ${SPACING.xs}px;
  background: ${MENU_COLORS.plinko.two}30;
  border-radius: 6px;
  border: 1px solid ${MENU_COLORS.plinko.one}30;
`

export const SProgressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xs}px;
  margin-bottom: ${SPACING.xxs}px;
`

export const SProgressDot = styled.div`
  width: 8px;
  height: 8px;
  background: ${MENU_COLORS.plinko.one};
  border-radius: 50%;
  animation: ${pulseAnimation} 1s infinite;
`

export const SProgressLabel = styled.span`
  font-weight: 500;
  color: ${MENU_COLORS.plinko.one};
  font-size: 12px;
`

export const SProgressText = styled.div`
  font-size: 11px;
  color: ${TEXT_COLORS.two};
  margin-bottom: ${SPACING.xxs}px;
`

export const SProgressBarContainer = styled.div`
  width: 100%;
  background: ${BORDER_COLORS.two};
  border-radius: 3px;
  height: 4px;
  overflow: hidden;
`

export const SProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${MENU_COLORS.plinko.one}, ${FARE_COLORS.pink});
  border-radius: 3px;
  transition: width 0.3s ease;
  width: ${({ $progress }) => $progress}%;
`

export const SSection = styled.div<{
  $variant?: 'config' | 'generation' | 'bucket' | 'testing' | 'stats'
}>`
  margin-bottom: ${SPACING.sm}px;
  padding: ${SPACING.xs}px;
  border-radius: 6px;
  border: 1px solid;

  ${({ $variant }) => {
    switch ($variant) {
      case 'config':
        return css`
          background: linear-gradient(90deg, ${FARE_COLORS.blue}30, ${FARE_COLORS.aqua}30);
          border-color: ${FARE_COLORS.blue}20;
        `
      case 'generation':
        return css`
          background: linear-gradient(90deg, ${COLORS.success}30, #10b981);
          border-color: ${COLORS.success}20;
        `
      case 'bucket':
        return css`
          background: linear-gradient(90deg, ${COLORS.warning}30, #f59e0b);
          border-color: ${COLORS.warning}20;
        `
      case 'testing':
        return css`
          background: linear-gradient(90deg, ${COLORS.error}30, ${FARE_COLORS.pink}30);
          border-color: ${COLORS.error}20;
        `
      case 'stats':
        return css`
          background: linear-gradient(90deg, ${FARE_COLORS.aqua}30, ${FARE_COLORS.blue}30);
          border-color: ${FARE_COLORS.aqua}20;
        `
      default:
        return css`
          background: ${BACKGROUND_COLORS.three};
          border-color: ${BORDER_COLORS.one};
        `
    }
  }}
`

export const SSectionTitle = styled.h3<{
  $variant?: 'config' | 'generation' | 'bucket' | 'testing' | 'stats'
}>`
  font-size: 14px;
  font-weight: bold;
  margin: 0 0 ${SPACING.xs}px 0;
  display: flex;
  align-items: center;
  gap: ${SPACING.xxs}px;

  ${({ $variant }) => {
    switch ($variant) {
      case 'config':
        return css`
          color: ${FARE_COLORS.blue};
        `
      case 'generation':
        return css`
          color: ${COLORS.success};
        `
      case 'bucket':
        return css`
          color: ${COLORS.warning};
        `
      case 'testing':
        return css`
          color: ${COLORS.error};
        `
      case 'stats':
        return css`
          color: ${FARE_COLORS.aqua};
        `
      default:
        return css`
          color: ${TEXT_COLORS.one};
        `
    }
  }}
`

export const SFormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.xs}px;
`

export const SFormField = styled.div``

export const SLabel = styled.label`
  display: block;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: ${SPACING.xxs}px;
  color: ${TEXT_COLORS.one};
`

export const SSelect = styled.select`
  width: 100%;
  padding: ${SPACING.xxs}px ${SPACING.xs}px;
  background: ${BACKGROUND_COLORS.four};
  border: 1px solid ${BORDER_COLORS.two};
  border-radius: 4px;
  color: ${TEXT_COLORS.one};
  font-size: 11px;

  &:focus {
    outline: none;
    border-color: ${FARE_COLORS.blue};
  }
`

export const SButtonGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xxs}px;
`

export const SHorizontalButtonGrid = styled.div`
  display: flex;
  gap: ${SPACING.xs}px;
`

export const SButton = styled.button<{
  $variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient'
  $disabled?: boolean
}>`
  width: 100%;
  padding: ${SPACING.xxs}px ${SPACING.xs}px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  font-size: 11px;

  ${({ $variant, $disabled }) => {
    if ($disabled) {
      return css`
        background: ${BACKGROUND_COLORS.four};
        color: ${TEXT_COLORS.three};
        border-color: ${BORDER_COLORS.one};
        cursor: not-allowed;
        opacity: 0.5;
      `
    }

    switch ($variant) {
      case 'primary':
        return css`
          background: ${FARE_COLORS.blue};
          color: ${TEXT_COLORS.one};
          border-color: ${FARE_COLORS.blue};

          &:hover {
            background: ${FARE_COLORS.blue}cc;
            box-shadow: 0 0 8px ${FARE_COLORS.blue}40;
          }
        `
      case 'success':
        return css`
          background: ${COLORS.success};
          color: ${TEXT_COLORS.one};
          border-color: ${COLORS.success};

          &:hover {
            background: ${COLORS.success}cc;
            box-shadow: 0 0 8px ${COLORS.success}40;
          }
        `
      case 'warning':
        return css`
          background: ${COLORS.warning};
          color: ${TEXT_COLORS.one};
          border-color: ${COLORS.warning};

          &:hover {
            background: ${COLORS.warning}cc;
            box-shadow: 0 0 8px ${COLORS.warning}40;
          }
        `
      case 'error':
        return css`
          background: ${COLORS.error};
          color: ${TEXT_COLORS.one};
          border-color: ${COLORS.error};

          &:hover {
            background: ${COLORS.error}cc;
            box-shadow: 0 0 8px ${COLORS.error}40;
          }
        `
      case 'gradient':
        return css`
          background: linear-gradient(90deg, ${MENU_COLORS.plinko.one}, ${FARE_COLORS.pink});
          color: ${TEXT_COLORS.one};
          border-color: transparent;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
          }
        `
      case 'secondary':
      default:
        return css`
          background: ${BACKGROUND_COLORS.four};
          color: ${TEXT_COLORS.one};
          border-color: ${BORDER_COLORS.two};

          &:hover {
            background: ${BACKGROUND_COLORS.three};
            border-color: ${FARE_COLORS.blue};
          }
        `
    }
  }}
`

export const SProgressDisplay = styled.div`
  padding: ${SPACING.xxs}px;
  background: ${FARE_COLORS.blue}10;
  border-radius: 4px;
  font-size: 11px;
  color: ${TEXT_COLORS.one};
`

export const SBucketGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${SPACING.xxs}px;
  margin-bottom: ${SPACING.xs}px;
`

export const SBucketButton = styled.button<{ $isSelected: boolean }>`
  padding: ${SPACING.xxs}px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;

  ${({ $isSelected }) =>
    $isSelected ?
      css`
        background: ${COLORS.warning};
        color: ${TEXT_COLORS.one};
        border-color: ${COLORS.warning};
      `
    : css`
        background: ${BACKGROUND_COLORS.four};
        color: ${TEXT_COLORS.two};
        border-color: ${BORDER_COLORS.two};

        &:hover {
          background: ${BACKGROUND_COLORS.three};
          color: ${TEXT_COLORS.one};
        }
      `}
`

export const SBucketStats = styled.div`
  font-size: 10px;
  color: ${TEXT_COLORS.two};
`

export const SEmptyState = styled.div`
  padding: ${SPACING.xs}px;
  background: ${BACKGROUND_COLORS.four};
  border-radius: 4px;
  text-align: center;
  color: ${TEXT_COLORS.two};
  font-size: 11px;
`

export const SAnimationInfo = styled.div`
  padding: ${SPACING.xs}px;
  background: ${BACKGROUND_COLORS.four};
  border-radius: 4px;
  margin-bottom: ${SPACING.xs}px;
`

export const SAnimationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xxs}px;
`

export const SAnimationTitle = styled.span`
  font-weight: 500;
  color: ${TEXT_COLORS.one};
  font-size: 11px;
`

export const SAnimationId = styled.span`
  font-size: 9px;
  color: ${TEXT_COLORS.three};
`

export const SAnimationDetails = styled.div`
  font-size: 10px;

  > div {
    margin-bottom: ${SPACING.xxs}px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`

export const SQualityBadge = styled.span`
  color: ${COLORS.success};
`

export const SNavigationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.xxs}px;
  margin-bottom: ${SPACING.xs}px;
`

export const SNavButton = styled.button<{ $disabled?: boolean }>`
  padding: ${SPACING.xxs}px ${SPACING.xs}px;
  background: ${BACKGROUND_COLORS.four};
  color: ${TEXT_COLORS.one};
  border: 1px solid ${BORDER_COLORS.two};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 10px;

  ${({ $disabled }) =>
    $disabled ?
      css`
        background: ${BACKGROUND_COLORS.four};
        color: ${TEXT_COLORS.three};
        cursor: not-allowed;
        opacity: 0.5;
      `
    : css`
        &:hover {
          background: ${BACKGROUND_COLORS.three};
          border-color: ${FARE_COLORS.blue};
        }
      `}
`

export const SIndexDisplay = styled.div`
  flex: 1;
  text-align: center;
  font-size: 10px;
  color: ${TEXT_COLORS.two};
`

export const SControlsGrid = styled.div`
  display: flex;
  gap: ${SPACING.xxs}px;
  margin-bottom: ${SPACING.xxs}px;
`

export const SIconButton = styled.button<{ $variant?: 'secondary' | 'error'; $disabled?: boolean }>`
  padding: ${SPACING.xs}px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 12px;

  ${({ $variant, $disabled }) => {
    if ($disabled) {
      return css`
        background: ${BACKGROUND_COLORS.four};
        color: ${TEXT_COLORS.three};
        border-color: ${BORDER_COLORS.one};
        cursor: not-allowed;
        opacity: 0.5;
        box-shadow: none;
      `
    }

    switch ($variant) {
      case 'error':
        return css`
          background: linear-gradient(90deg, ${COLORS.error}, #dc2626);
          color: ${TEXT_COLORS.one};
          border-color: transparent;

          &:hover {
            background: linear-gradient(90deg, #dc2626, #b91c1c);
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
      case 'secondary':
      default:
        return css`
          background: linear-gradient(90deg, ${BACKGROUND_COLORS.four}, ${BACKGROUND_COLORS.three});
          color: ${TEXT_COLORS.one};
          border-color: ${BORDER_COLORS.two};

          &:hover {
            background: linear-gradient(90deg, ${BACKGROUND_COLORS.three}, ${BORDER_COLORS.three});
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
        `
    }
  }}
`

export const SStatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.xs}px;
  margin-bottom: ${SPACING.xs}px;
`

export const SStatCard = styled.div<{ $variant?: 'default' | 'success' | 'warning' | 'error' }>`
  text-align: center;
  padding: ${SPACING.xs}px;
  border-radius: 4px;
  border: 1px solid;

  ${({ $variant }) => {
    switch ($variant) {
      case 'success':
        return css`
          background: ${COLORS.success}30;
          border-color: ${COLORS.success}20;
        `
      case 'warning':
        return css`
          background: ${COLORS.warning}30;
          border-color: ${COLORS.warning}20;
        `
      case 'error':
        return css`
          background: ${COLORS.error}30;
          border-color: ${COLORS.error}20;
        `
      default:
        return css`
          background: ${BACKGROUND_COLORS.one}80;
          border-color: transparent;
        `
    }
  }}
`

export const SStatLabel = styled.div`
  font-size: 10px;
  color: ${TEXT_COLORS.two};
  margin-bottom: ${SPACING.xxs}px;
`

export const SStatValue = styled.div<{ $variant?: 'default' | 'success' | 'warning' | 'error' }>`
  font-size: 16px;
  font-weight: bold;

  ${({ $variant }) => {
    switch ($variant) {
      case 'success':
        return css`
          color: ${COLORS.success};
        `
      case 'warning':
        return css`
          color: ${COLORS.warning};
        `
      case 'error':
        return css`
          color: ${COLORS.error};
        `
      case 'default':
      default:
        return css`
          color: ${TEXT_COLORS.one};
        `
    }
  }}
`

export const SStatValueSmall = styled(SStatValue)`
  font-size: 14px;
`

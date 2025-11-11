// @ts-nocheck
import { ButtonEnum } from '.'
import { BACKGROUND_COLORS, BORDER_COLORS, COLORS, FARE_COLORS, TEXT_COLORS } from '@/design/colors'
import { SPACING } from '@/design/spacing'
import { motion } from 'framer-motion'
import { noUserSelect } from '@/style'
import { keyframes, styled } from 'styled-components'

const flashBar = keyframes`
  0% {
    opacity: 0%;
  }

  50% {
    opacity: 100%;
  }

  100% {
    opacity: 0%;
  }
`

export const BaseButton = styled(motion.button)<{
  buttonType?: ButtonEnum
  isLoading?: boolean
  $isMinified?: boolean
}>`
  text-transform: uppercase;
  color: ${TEXT_COLORS.one};
  padding: ${SPACING.sm}px;
  border-radius: 6px;
  cursor: pointer;
  bottom: ${SPACING.lg}px;
  width: auto;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid ${BORDER_COLORS.one};
  transition: 0.2s all ease-in-out;
  text-wrap: nowrap;
  ${noUserSelect}

  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  -moz-backdrop-filter: blur(2px);
  -ms-backdrop-filter: blur(2px);

  &.copy-btn {
    width: 100px;
    background-color: ${FARE_COLORS.aqua}50;
    color: white;
    font-weight: bold;
    height: 40px;
    padding-top: 10px;
  }

  ${props => (props.$isMinified ? `${SPACING.xs}px ${SPACING.sm}px` : `${SPACING.sm}px`)}

  > div {
    line-height: 1px;
  }

  > img {
    margin-left: ${SPACING.xs}px;
    height: 18px;
  }

  > div:nth-child(2) {
    margin: 0 ${SPACING.sm}px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (max-width: 1200px) {
    margin-block: 5px;
    height: 3rem;
    align-items: normal;
    text-wrap: nowrap;
  }

  ${({ buttonType, isLoading }) => {
    if (buttonType === ButtonEnum.BASE) {
      return `      
      &:hover {
          border: 1px solid ${FARE_COLORS.blue};
        }
      `
    }

    if (buttonType === ButtonEnum.EDIT_1) {
      return `
        border: 1px solid ${BORDER_COLORS.one};
        box-shadow: inset 0px 0px 56px ${FARE_COLORS.blue}00;

        &:hover {
          border: 1px solid ${FARE_COLORS.blue};
          box-shadow: inset 0px 0px 56px ${FARE_COLORS.blue}75;
        }
      `
    }

    if (buttonType === ButtonEnum.PRIMARY_1) {
      return `
        border: 1px solid ${FARE_COLORS.blue};
        box-shadow: 0px 0px 3px ${FARE_COLORS.blue}, inset 0px 0px 56px ${FARE_COLORS.blue}00;
        background: transparent;

        &:hover {
          background: ${FARE_COLORS.blue}00;
          box-shadow: 0px 0px 5px ${FARE_COLORS.blue}, inset 0px 0px 56px ${FARE_COLORS.blue}75;
        }
      `
    }

    if (buttonType === ButtonEnum.PRIMARY_2) {
      return `
      background: #141223;
      
      &:hover {
          border: 1px solid ${FARE_COLORS.blue};
          box-shadow: 0px 0px 5px ${FARE_COLORS.blue};
        }
      `
    }

    if (buttonType === ButtonEnum.CONNECT_WALLET) {
      return `
        border: 1px solid ${FARE_COLORS.aqua};
        box-shadow: 0px 0px 3px ${FARE_COLORS.aqua}, inset 0px 0px 56px ${FARE_COLORS.aqua}00;
        background: transparent;

        &:hover {
          &:not(:disabled) {
            background: ${FARE_COLORS.aqua}00;
            box-shadow: 0px 0px 5px ${FARE_COLORS.aqua}, inset 0px 0px 56px ${FARE_COLORS.aqua}75;
          }
        }
      `
    }

    if (buttonType === ButtonEnum.QUICKPLAY) {
      return css`
        border: solid 1px transparent;
        background-image:
          linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0)),
          linear-gradient(101deg, ${FARE_COLORS.peach}, ${FARE_COLORS.aqua});
        background-origin: border-box;
        background-clip: content-box, border-box;
        box-shadow: 2px 1000px 1px #000 inset;

        &:hover {
          border: solid 1px transparent;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0)),
            linear-gradient(101deg, ${FARE_COLORS.peach}, ${FARE_COLORS.aqua});
          background-origin: border-box;
          background-clip: content-box, border-box;
          box-shadow: 2px 1000px 1px #000 inset;
        }
      `
    }

    if (buttonType === ButtonEnum.WARNING) {
      return `
        border: 1px solid ${COLORS.warning};
        box-shadow: 0px 0px 3px ${COLORS.warning};
        background: ${isLoading ? 'transparent' : `${COLORS.warning}35`};

        &:hover {
          background: ${COLORS.warning}50;
          box-shadow: 0px 0px 5px ${COLORS.warning};
        }
      `
    }

    if (buttonType === ButtonEnum.ERROR) {
      return `
        border: 1px solid ${COLORS.error};
        box-shadow: 0px 0px 3px ${COLORS.error};
        background: ${isLoading ? 'transparent' : `${COLORS.error}35`};

        &:hover {
          background: ${COLORS.error}50;
          box-shadow: 0px 0px 5px ${COLORS.error};
        }
      `
    }

    if (buttonType === ButtonEnum.ERROR_2) {
      return `
      border: 1px solid ${COLORS.error};
      box-shadow: 0px 0px 3px ${COLORS.error};

      &:hover {
        background: ${COLORS.error}50;
        box-shadow: 0px 0px 5px ${COLORS.error};
      }
    `
    }
  }}
`

export const LoadingBar = styled.div<{
  $side: 'left' | 'right'
  $buttonType: ButtonEnum
}>`
  position: absolute;
  width: 2px;
  height: 20px;
  opacity: 0;
  animation: 2s ${flashBar} infinite;
  top: 0px;
  /* border: 1px solid ${FARE_COLORS.blue}00; */
  /* box-shadow: inset 0px 0px 10px ${FARE_COLORS.blue}00; */

  ${({ $buttonType }) => {
    if ($buttonType === ButtonEnum.PRIMARY_1) {
      return `
        opacity: 1;
        border: 1px solid ${FARE_COLORS.blue};
        box-shadow: inset 0px 0px 10px ${FARE_COLORS.blue}99;
      `
    }

    if ($buttonType === ButtonEnum.CONNECT_WALLET) {
      return `
        border: 1px solid ${FARE_COLORS.aqua};
        box-shadow: inset 0px 0px 10px ${FARE_COLORS.aqua}99;
      `
    }
  }}

  ${({ $side }) => css`
    /* ${$side}: ${SPACING.md}px; */
    ${$side}: -8px;
  `}
`

export const ModeButton = styled.button<{ $isActive?: boolean }>`
  height: 30px;
  min-width: 40px;
  border-radius: 4px;
  background: transparent;
  transition: 0.2s all ease-in-out;
  cursor: pointer;

  &:focus-visible {
    outline: none;
  }
  &:hover {
    border: 1px solid ${FARE_COLORS.blue}99 !important;
  }

  > span {
    font-family: 'GohuUppercase', monospace;
    line-height: 10px;
  }

  &:has(span) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  ${({ $isActive }) =>
    $isActive ?
      css`
        border: 1px solid ${FARE_COLORS.blue} !important;
        color: ${TEXT_COLORS.one};
        background: ${BACKGROUND_COLORS.four};
      `
    : css`
        border: 1px solid ${BORDER_COLORS.one};
        color: ${TEXT_COLORS.two};
      `};
`

export const ButtonContentWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

// @ts-nocheck
import { type HTMLMotionProps } from 'framer-motion'
import { type ReactNode } from 'react'

import { BaseButton, ButtonContentWrapper, LoadingBar } from './style'

export enum ButtonEnum {
  BASE,
  PRIMARY_1,
  PRIMARY_2,
  CONNECT_WALLET,
  QUICKPLAY,
  WARNING,
  ERROR,
  ERROR_2,
  EDIT_1,
}

interface IButtonProps extends HTMLMotionProps<'button'> {
  buttonType: ButtonEnum
  children?: ReactNode | undefined
  disabled: boolean
  isLoading?: boolean
  loadingText?: string | JSX.Element
  isMinified?: boolean
}

export const Button = ({
  buttonType,
  disabled,
  isLoading,
  loadingText = 'Loading',
  children,
  isMinified,
  ...props
}: IButtonProps) => {
  return (
    <BaseButton
      {...props}
      transition={{ duration: 0.25 }}
      buttonType={buttonType}
      disabled={disabled}
      isLoading={isLoading}
      $isMinified={isMinified}
    >
      <ButtonContentWrapper>
        {isLoading && <LoadingBar $side={'left'} $buttonType={buttonType} />}
        <div>{isLoading ? loadingText : children}</div>
        {isLoading && <LoadingBar $side={'right'} $buttonType={buttonType} />}
      </ButtonContentWrapper>
    </BaseButton>
  )
}

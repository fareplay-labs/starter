// @ts-nocheck
import React from 'react'
import { SFormLayoutContainer } from './styled'

interface StandardFormLayoutProps {
  children: React.ReactNode
  'data-testid'?: string // Allow passing test-id
}

export const StandardFormLayout: React.FC<StandardFormLayoutProps> = ({
  children,
  'data-testid': dataTestId,
}) => {
  return <SFormLayoutContainer data-testid={dataTestId}>{children}</SFormLayoutContainer>
}

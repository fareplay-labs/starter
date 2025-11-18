// @ts-nocheck
import React from 'react'
import { Container, Header } from '../styled'
import { SLabel } from './styled'

interface FormGroupProps {
  label: string
  children: React.ReactNode
}

/**
 * A consistent container for form controls with a label
 */
const FormGroup: React.FC<FormGroupProps> = ({ label, children }) => {
  return (
    <Container>
      <Header>
        <SLabel>{label}</SLabel>
      </Header>
      {children}
    </Container>
  )
}

export { FormGroup }

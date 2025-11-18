// @ts-nocheck
import React from 'react'
import { SErrorDisplay } from './styled'
interface FormErrorDisplayProps {
  message: string | null | undefined
}

export const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({ message }) => {
  if (!message) {
    return null
  }
  return <SErrorDisplay>{message}</SErrorDisplay>
}

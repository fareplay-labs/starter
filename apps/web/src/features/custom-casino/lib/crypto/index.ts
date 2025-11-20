// @ts-nocheck
import { type BigNumber } from 'ethers'

export function multiplyBigNumberWithFixedPointNumber(
  bigNumber: BigNumber,
  fixedPointNumber: string
): BigNumber {
  const dotIndex = fixedPointNumber.indexOf('.')
  if (dotIndex === -1) {
    return bigNumber.mul(fixedPointNumber)
  }
  const digitCountAfterDot = fixedPointNumber.slice(dotIndex + 1).length
  const divisor = 10 ** digitCountAfterDot
  const multiplier = fixedPointNumber.replace('.', '')

  return bigNumber.mul(multiplier).div(divisor)
}

export * from './contracts'
export * from './types'

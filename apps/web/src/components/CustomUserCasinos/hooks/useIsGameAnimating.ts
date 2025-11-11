// @ts-nocheck
import { useMemo } from 'react'

/**
 * Demo-only helper that always reports the game animation
 * as idle so form controls stay enabled.
 */
export const useIsGameAnimating = () => {
  return useMemo(() => ({ isGameAnimating: false }), [])
}

export default useIsGameAnimating

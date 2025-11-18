// @ts-nocheck
import { useEffect, useCallback } from 'react'
import { AppGameName } from '@/chains/types'

export interface CustomGameResolvePayload {
  gameName: string
  trialId: string
  resultSides: any[]
  playedCount: number
  totalDeltaAmount: number
  deltaAmounts: number[]
  deltaAmountsInUsd: number[]
}

interface UseCustomGameResolveEventOptions {
  gameName: AppGameName
  onResolve: (payload: CustomGameResolvePayload) => void
  enabled?: boolean
}

/**
 * Hook to listen for custom game resolve events dispatched from the socket layer
 * This replaces direct socket listening which wasn't working due to protected properties
 */
export const useCustomGameResolveEvent = ({
  gameName,
  onResolve,
  enabled = true,
}: UseCustomGameResolveEventOptions) => {
  const handleCustomGameResolve = useCallback(
    (event: Event) => {
      const customEvent = event as CustomEvent<CustomGameResolvePayload>
      const payload = customEvent.detail
      
      // Filter by game name
      if (payload.gameName !== gameName) {
        return
      }
      onResolve(payload)
    },
    [gameName, onResolve]
  )

  useEffect(() => {
    if (!enabled) {
      return
    }
    
    // Listen to the custom event dispatched from user.space.ts
    window.addEventListener('customGameResolve', handleCustomGameResolve)
    
    return () => {
      window.removeEventListener('customGameResolve', handleCustomGameResolve)
    }
  }, [enabled, gameName, handleCustomGameResolve])
}
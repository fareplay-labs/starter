// @ts-nocheck
import { useMemo, useCallback } from 'react'
import useSUContractStore from '@/components/CustomUserCasinos/store/useSUContractStore'

/**
 * Demo-only stub of the on-chain game contract hook.
 * It exposes the same surface area as the production hook
 * but all actions are inert so that forms can keep their logic intact.
 */
export const useGameContract = () => {
  const suStore = useSUContractStore()

  const submitEntry = useCallback(async (_formData: any) => {
    // In demo mode we resolve entries locally, so there's nothing to submit.
    return Promise.resolve()
  }, [])

  const approveContracts = useCallback(async () => Promise.resolve(), [])

  return useMemo(
    () => ({
      submitEntry,
      approveContracts,
      isApprovingContracts: false,
      hasApprovedContracts: true,
      isSubmitting: suStore.isSubmitting,
      inProgressEntry: suStore.inProgressEntry,
      setSubmittedSide: suStore.setSubmittedSide,
      setSubmittedAmount: suStore.setSubmittedAmount,
      setEntryCount: suStore.setEntryCount,
    }),
    [approveContracts, submitEntry, suStore],
  )
}

export default useGameContract

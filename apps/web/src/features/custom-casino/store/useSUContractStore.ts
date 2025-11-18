// @ts-nocheck
import { create } from 'zustand'

/**
 * Minimal stub of the smart-contract store so CustomGames can
 * keep their original hooks without requiring blockchain integrations.
 */
const useSUContractStore = create(() => ({
  isSubmitting: false,
  isApprovingContracts: false,
  hasApprovedContracts: true,
  inProgressEntry: null,
  approvedGameState: null,
  setIsSubmitting: () => {},
  setInProgressEntry: () => {},
  setSubmittedSide: () => {},
  setSubmittedAmount: () => {},
  setEntryCount: () => {},
  setIsApprovingContracts: () => {},
  setHasApprovedContracts: () => {},
}))

export default useSUContractStore

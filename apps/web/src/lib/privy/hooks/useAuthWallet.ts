import { useAuth } from '@/hooks/useAuth'

type SessionState = 'verified' | 'unverified'

export const useAuthWallet = () => {
  const { isAuthenticated } = useAuth()
  const sessionVerifyState: SessionState = isAuthenticated ? 'verified' : 'unverified'

  return {
    sessionVerifyState,
  }
}

import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface WalletLike {
  address: string
}

export const useActiveWallet = () => {
  const { publicKey, connected } = useWallet()

  const address = publicKey?.toBase58() ?? ''

  return useMemo(() => {
    const normalized: WalletLike | null = address ? { address } : null

    return {
      walletAddress: address,
      privyWallet: normalized,
      externalWallet: normalized,
      readyAndAuth: Boolean(address && connected),
    }
  }, [address, connected])
}

import { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, setProvider } from '@coral-xyz/anchor';
import { parseUnits } from 'viem';
import fareVaultIdl from '@/lib/solana/fare_vault.json';

interface PoolInfo {
  account: string;
  config: {
    manager: string;
    feePlayMul: number;
    feeLossMul: number;
    feeMintMul: number;
    feeHostPct: number;
    feePoolPct: number;
    probability: number;
    minLimitForTicket: number;
  };
  accum: string;
}

export function usePoolManager() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getProgram = useCallback(() => {
    if (!wallet || !connection) {
      throw new Error('Wallet or connection not available');
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
    setProvider(provider);

    return new Program(fareVaultIdl as any, provider);
  }, [wallet, connection]);

  const fetchPools = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    try {
      const program = getProgram();
      const allPools = await (program.account as any).poolState.all();
      
      const poolsInfo: PoolInfo[] = allPools.map((pool: any) => ({
        account: pool.publicKey.toString(),
        config: {
          manager: pool.account.config.manager.toString(),
          feePlayMul: pool.account.config.feePlayMul,
          feeLossMul: pool.account.config.feeLossMul,
          feeMintMul: pool.account.config.feeMintMul,
          feeHostPct: pool.account.config.feeHostPct,
          feePoolPct: pool.account.config.feePoolPct,
          probability: pool.account.config.probability,
          minLimitForTicket: pool.account.config.minLimitForTicket,
        },
        accum: (BigInt(pool.account.accum.toString()) / BigInt(1e6)).toString(),
      }));

      setPools(poolsInfo);
      return poolsInfo;
    } catch (err) {
      console.error('Failed to fetch pools:', err);
      setError('Failed to fetch registered pools');
      return [];
    } finally {
      setIsFetching(false);
    }
  }, [getProgram]);

  const createPool = useCallback(
    async (config: {
      feePlayMul: string;
      feeLossMul: string;
      feeMintMul: string;
      feeHostPct: string;
      feePoolPct: string;
      probability: string;
      minLimitForTicket: string;
    }) => {
      if (!wallet.publicKey) {
        throw new Error('Wallet not connected');
      }

      setIsCreating(true);
      setError(null);

      try {
        const program = getProgram();
        const poolKeypair = Keypair.generate();

        const poolConfig = {
          manager: wallet.publicKey,
          feePlayMul: parseFloat(config.feePlayMul),
          feeLossMul: parseFloat(config.feeLossMul),
          feeMintMul: parseFloat(config.feeMintMul),
          feeHostPct: parseFloat(config.feeHostPct),
          feePoolPct: parseFloat(config.feePoolPct),
          probability: parseFloat(config.probability),
          minLimitForTicket: Number(parseUnits(config.minLimitForTicket, 9)),
        };

        const tx = await program.methods
          .poolRegister(poolConfig)
          .accountsPartial({
            payer: wallet.publicKey,
            pool: poolKeypair.publicKey,
          })
          .signers([poolKeypair])
          .rpc();

        const poolAddress = poolKeypair.publicKey.toString();

        // Refresh pools
        await fetchPools();

        return { tx, poolAddress };
      } catch (err) {
        console.error('Pool creation failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to create pool: ${errorMessage}`);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [wallet, getProgram, fetchPools]
  );

  return {
    pools,
    isCreating,
    isFetching,
    error,
    createPool,
    fetchPools,
    clearError: () => setError(null),
  };
}


import { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { Trial } from '@fare-casino/types';

interface WebSocketContextType {
  trialRegistered: Trial | null;
  trialResolved: Trial | null;
  connected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { publicKey } = useWallet();
  
  const { trialRegistered, trialResolved, connected } = useWebSocket({
    playerAddress: publicKey?.toBase58(),
  });

  return (
    <WebSocketContext.Provider value={{ trialRegistered, trialResolved, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useGameWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useGameWebSocket must be used within WebSocketProvider');
  }
  return context;
}


import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { api } from '@/services/api';
import bs58 from 'bs58';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  error: string | null;
}

export function useAuth() {
  const { publicKey, signMessage, connected } = useWallet();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  });

  // Check if already authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && connected && publicKey) {
      // Verify token is still valid
      api.getMe()
        .then((user) => {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            error: null,
          });
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null,
          });
        });
    }
  }, [connected, publicKey]);

  const login = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected');
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const address = publicKey.toBase58();

      // 1. Get nonce message from backend
      const { message } = await api.getNonce(address);

      // 2. Sign the message with wallet
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // 3. Send signature to backend for verification
      const response = await api.login({
        address,
        signature,
        message,
      });

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        error: null,
      });

      return response;
    } catch (error: any) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error.message || 'Authentication failed',
      });
      throw error;
    }
  }, [publicKey, signMessage]);

  const logout = () => {
    api.logout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  };

  return {
    ...state,
    login,
    logout,
  };
}


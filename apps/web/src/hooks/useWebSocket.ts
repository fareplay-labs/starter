import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Trial } from '@fare-casino/types';

interface UseWebSocketOptions {
  casinoId?: string;
  playerAddress?: string;
}

interface WebSocketState {
  connected: boolean;
  error: string | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    error: null,
  });

  const [trialRegistered, setTrialRegistered] = useState<Trial | null>(null);
  const [trialResolved, setTrialResolved] = useState<Trial | null>(null);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

    // Connect to WebSocket
    const socket = io(`${WS_URL}/casino`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setState({ connected: true, error: null });

      // Subscribe to live trials
      if (options.casinoId) {
        socket.emit('subscribeLiveTrials', { casinoId: options.casinoId });
      } else {
        socket.emit('subscribeLiveTrials', {});
      }

      // Subscribe to player trials if address provided
      if (options.playerAddress) {
        socket.emit('subscribePlayerTrials', { address: options.playerAddress });
      }
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setState({ connected: false, error: null });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState({ connected: false, error: error.message });
    });

    // Event handlers
    socket.on('trialRegistered', (trial: Trial) => {
      console.log('Trial registered:', trial);
      setTrialRegistered(trial);
    });

    socket.on('trialResolved', (trial: Trial) => {
      console.log('Trial resolved:', trial);
      setTrialResolved(trial);
    });

    socket.on('statsUpdate', (stats: any) => {
      console.log('Stats updated:', stats);
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [options.casinoId, options.playerAddress]);

  return {
    ...state,
    trialRegistered,
    trialResolved,
    socket: socketRef.current,
  };
}


import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Trial } from '@fare-casino/types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UseWebSocketProps {
  playerAddress?: string;
}

export function useWebSocket({ playerAddress }: UseWebSocketProps = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trialRegistered, setTrialRegistered] = useState<Trial | null>(null);
  const [trialResolved, setTrialResolved] = useState<Trial | null>(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    socketInstance.on('trialRegistered', (trial: Trial) => {
      setTrialRegistered(trial);
    });

    socketInstance.on('trialResolved', (trial: Trial) => {
      setTrialResolved(trial);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [playerAddress]);

  return { socket, isConnected, trialRegistered, trialResolved, connected: isConnected };
}

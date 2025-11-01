import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWallet } from '@solana/wallet-adapter-react';

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  deleted: boolean;
  user: {
    address: string;
    username?: string;
    avatarUrl?: string;
  };
}

export function useChat() {
  const { publicKey } = useWallet();
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await fetch(`${API_URL}/api/chat?limit=50`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080';

    // Connect to chat WebSocket
    const socket = io(`${WS_URL}/chat`, {
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Chat connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected');
      setConnected(false);
    });

    // Listen for new messages
    socket.on('newMessage', (message: ChatMessage) => {
      console.log('New message:', message);
      setMessages((prev) => [...prev, message]);
    });

    // Listen for deleted messages
    socket.on('messageDeleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, deleted: true, message: '[Deleted]' } : m
        )
      );
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = async (message: string) => {
    if (!publicKey || !socketRef.current) {
      throw new Error('Wallet not connected or chat not initialized');
    }

    setSending(true);

    try {
      const result: any = await new Promise((resolve, reject) => {
        socketRef.current!.emit(
          'sendMessage',
          {
            message,
            userAddress: publicKey.toBase58(),
          },
          (response: any) => {
            if (response.success) {
              resolve(response.message);
            } else {
              reject(new Error(response.error));
            }
          }
        );

        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Send message timeout')), 5000);
      });

      return result;
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!publicKey || !socketRef.current) {
      return;
    }

    socketRef.current.emit('deleteMessage', {
      messageId,
      userAddress: publicKey.toBase58(),
    });
  };

  return {
    messages,
    connected,
    sending,
    loading,
    sendMessage,
    deleteMessage,
  };
}


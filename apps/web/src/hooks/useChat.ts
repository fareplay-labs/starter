import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { useWallet } from '@solana/wallet-adapter-react';

export interface ChatMessage {
  id: string;
  message: string;
  user: {
    address: string;
    username?: string;
  };
  createdAt: string;
  deleted?: boolean;
}

export function useChat() {
  const { socket, isConnected } = useWebSocket();
  const { publicKey } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load initial messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Request initial messages
    socket.emit('chat:getMessages', (response: ChatMessage[]) => {
      setMessages(response || []);
      setLoading(false);
    });

    // Listen for new messages
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    // Listen for deleted messages
    const handleDeleteMessage = (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, deleted: true } : msg,
        ),
      );
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:messageDeleted', handleDeleteMessage);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:messageDeleted', handleDeleteMessage);
    };
  }, [socket, isConnected]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!socket || !publicKey || !message.trim()) {
        throw new Error(
          'Cannot send message: wallet not connected or message is empty',
        );
      }

      setSending(true);

      return new Promise<void>((resolve, reject) => {
        socket.emit(
          'chat:sendMessage',
          { message: message.trim() },
          (response: {
            success: boolean;
            error?: string;
            message?: ChatMessage;
          }) => {
            setSending(false);

            if (response.success) {
              resolve();
            } else {
              reject(new Error(response.error || 'Failed to send message'));
            }
          },
        );
      });
    },
    [socket, publicKey],
  );

  return {
    messages,
    connected: isConnected,
    loading,
    sending,
    sendMessage,
  };
}

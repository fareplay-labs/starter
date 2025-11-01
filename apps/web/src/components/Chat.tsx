import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export function Chat() {
  const { publicKey, connected: walletConnected } = useWallet();
  const { messages, connected, sending, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending || !walletConnected) return;

    try {
      await sendMessage(input.trim());
      setInput(''); // Clear input after sending
    } catch (error: any) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message', { description: error.message });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle Button - Fixed to right side */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={`fixed top-1/2 -translate-y-1/2 z-40 rounded-l-lg rounded-r-none shadow-lg transition-all duration-300 ${
          isOpen ? 'right-80' : 'right-0'
        }`}
        aria-label="Toggle chat"
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>

      {/* Chat Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen w-80 bg-background border-l shadow-2xl z-30 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h3 className="text-lg font-bold">Chat</h3>
          </div>
          <Badge variant={connected ? 'default' : 'secondary'} className="gap-1">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            {connected ? 'Live' : 'Connecting...'}
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 text-sm">
              No messages yet. Be the first to chat!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = publicKey?.toBase58() === msg.user.address;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } ${msg.deleted ? 'opacity-50 italic' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold">
                        {msg.user.username ||
                          `${msg.user.address.slice(0, 4)}...${msg.user.address.slice(-4)}`}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm break-words">
                      {msg.deleted ? '[Message deleted]' : msg.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          {!walletConnected ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Connect your wallet to chat
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay - Click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

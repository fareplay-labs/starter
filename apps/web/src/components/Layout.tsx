import { ReactNode } from 'react';
import { Header } from './Header';
import { AppToaster } from '@/components/ui/sonner-toaster';
import { Chat } from './Chat';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-casino-darker border-t border-casino-border mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2024 Fare Casino. Powered by Solana.</p>
        </div>
      </footer>
      
      {/* Chat Sidebar - Persists across all pages */}
      <Chat />

      {/* Toasts */}
      <AppToaster />
    </div>
  );
}


import { ReactNode } from 'react';
import { Header } from './Header';
import { AppToaster } from '@/components/ui/sonner-toaster';
import { Chat } from './Chat';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-black/60 backdrop-blur-md border-t border-white/10 mt-20">
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


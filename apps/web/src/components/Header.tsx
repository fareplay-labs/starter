import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ui/theme-toggle';

export function Header() {
  const { connected, publicKey } = useWallet();
  const { isAuthenticated, isLoading, login, logout, user, error } = useAuth();
  const location = useLocation();
  const loginAttemptedFor = useRef<string | null>(null);

  const handleManualSignIn = async () => {
    try {
      await login();
    } catch (error) {
      // Error is already handled in useAuth
    }
  };

  // Auto sign-in when wallet connects
  useEffect(() => {
    const walletAddress = publicKey?.toBase58();
    
    // Only attempt login if:
    // 1. Wallet is connected
    // 2. Not already authenticated
    // 3. Not currently loading
    // 4. Haven't attempted for this wallet address yet
    if (
      connected &&
      walletAddress &&
      !isAuthenticated &&
      !isLoading &&
      loginAttemptedFor.current !== walletAddress
    ) {
      loginAttemptedFor.current = walletAddress;
      
      // Small delay to ensure wallet is fully ready
      const timer = setTimeout(() => {
        login().catch((error) => {
          console.error('Auto sign-in failed:', error);
          // Don't reset flag - user can manually disconnect/reconnect to retry
        });
      }, 100);

      return () => clearTimeout(timer);
    }

    // Reset flag when wallet disconnects
    if (!connected) {
      loginAttemptedFor.current = null;
    }
  }, [connected, publicKey, isAuthenticated, isLoading, login]);

  return (
    <header className="bg-casino-darker border-b border-casino-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-casino-accent cursor-pointer hover:text-casino-accent/80 transition-colors">
                🎰 Fare Casino
              </h1>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`transition-colors ${
                  location.pathname === '/' ? 'active-link' : 'inactive-link'
                }`}
              >
                Casino
              </Link>
              <Link
                to="/dashboard"
                className={`transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-white font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className={`transition-colors ${
                  location.pathname === '/settings'
                    ? 'active-link'
                    : 'inactive-link'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <div className="text-sm text-gray-400">
                Welcome,{' '}
                {user.username ||
                  `${user.address.slice(0, 4)}...${user.address.slice(-4)}`}
              </div>
            )}

            {connected && !isAuthenticated && isLoading && (
              <div className="text-sm text-gray-400 animate-pulse">
                Signing in...
              </div>
            )}

            {connected && !isAuthenticated && !isLoading && error && (
              <Button onClick={handleManualSignIn} variant="default" size="md">
                ✍️ Sign In
              </Button>
            )}

            {isAuthenticated && (
              <Button onClick={logout} variant="outline" size="sm">
                Sign Out
              </Button>
            )}

            <WalletMultiButton />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

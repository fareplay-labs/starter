import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserPage } from './features/custom-casino/UserPage/UserPage';
import CustomGamesRouter from './features/custom-casino/CustomGames/shared/CustomGamePage/CustomGameRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <WebSocketProvider>
          <ThemeProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  <Route path="/" element={<UserPage />} />
                  <Route path="/dashboard" element={<Home />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/play/:gameType" element={<CustomGamesRouter />} />
                  <Route path="/play/:gameType/:instanceId" element={<CustomGamesRouter />} />
                  <Route path="/casino/:username" element={<UserPage />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </ThemeProvider>
        </WebSocketProvider>
      </WalletContextProvider>
    </QueryClientProvider>
  );
}

export default App;

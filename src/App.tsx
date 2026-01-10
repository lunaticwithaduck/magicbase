import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store, useAppSelector } from '@/store/store';
import { Header } from '@/components/Header/Header';
import { SearchPage } from '@/pages/SearchPage/SearchPage';
import { DecksPage } from '@/pages/DecksPage/DecksPage';
import { SetsPage } from '@/pages/SetsPage/SetsPage';
import { Toaster } from '@/components/Toast/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/sets" element={<SetsPage />} />
        </Routes>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

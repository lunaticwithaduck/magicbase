import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { store, useAppSelector } from '@/store/store';
import { Header } from '@/components/Header/Header';
import { SearchPage } from '@/pages/SearchPage/SearchPage';
import { DecksPage } from '@/pages/DecksPage/DecksPage';
import { SetsPage } from '@/pages/SetsPage/SetsPage';
import { Toaster } from '@/components/Toast/Toast';
import { AIChat } from '@/components/AIChat/AIChat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full"
      >
        <Routes location={location}>
          <Route path="/" element={<SearchPage />} />
          <Route path="/decks" element={<DecksPage />} />
          <Route path="/sets" element={<SetsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  return (
    <ThemeProvider>
      <div className="h-screen overflow-hidden bg-background flex flex-col">
        <Header />
        <div className="flex-1 min-h-0 h-full">
          <AnimatedRoutes />
        </div>
        <Toaster />
        <AIChat />
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </QueryClientProvider>
    </Provider>
  );
}

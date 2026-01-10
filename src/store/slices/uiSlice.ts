import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  cardDetailModalOpen: boolean;
  selectedCardId: string | null;
  deckBuilderOpen: boolean;
  theme: 'light' | 'dark';
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  };
}

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mtg-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

const initialState: UIState = {
  sidebarOpen: true,
  cardDetailModalOpen: false,
  selectedCardId: null,
  deckBuilderOpen: false,
  theme: getInitialTheme(),
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    openCardDetail: (state, action: PayloadAction<string>) => {
      state.selectedCardId = action.payload;
      state.cardDetailModalOpen = true;
    },

    closeCardDetail: (state) => {
      state.cardDetailModalOpen = false;
      state.selectedCardId = null;
    },

    toggleDeckBuilder: (state) => {
      state.deckBuilderOpen = !state.deckBuilderOpen;
    },

    setDeckBuilderOpen: (state, action: PayloadAction<boolean>) => {
      state.deckBuilderOpen = action.payload;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('mtg-theme', state.theme);
    },

    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('mtg-theme', state.theme);
    },

    showToast: (
      state,
      action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' }>
    ) => {
      state.toast = {
        ...action.payload,
        visible: true,
      };
    },

    hideToast: (state) => {
      state.toast.visible = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openCardDetail,
  closeCardDetail,
  toggleDeckBuilder,
  setDeckBuilderOpen,
  toggleTheme,
  setTheme,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SearchFilters } from '@/types/search';

interface SearchState {
  filters: SearchFilters;
  recentSearches: string[];
  viewMode: 'grid' | 'list' | 'images';
}

const initialState: SearchState = {
  filters: {
    query: '',
    colors: [],
    colorMatch: 'include',
    rarity: [],
    sortBy: 'name',
    sortDirection: 'asc',
  },
  recentSearches: [],
  viewMode: 'grid',
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<SearchFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    setQuery: (state, action: PayloadAction<string>) => {
      state.filters.query = action.payload;
    },

    addRecentSearch: (state, action: PayloadAction<string>) => {
      const search = action.payload.trim();
      if (search && !state.recentSearches.includes(search)) {
        state.recentSearches = [search, ...state.recentSearches].slice(0, 10);
      }
    },

    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },

    setViewMode: (state, action: PayloadAction<'grid' | 'list' | 'images'>) => {
      state.viewMode = action.payload;
    },

    toggleColor: (state, action: PayloadAction<string>) => {
      const colors = state.filters.colors || [];
      const index = colors.indexOf(action.payload);
      if (index === -1) {
        state.filters.colors = [...colors, action.payload];
      } else {
        state.filters.colors = colors.filter((c) => c !== action.payload);
      }
    },

    toggleRarity: (state, action: PayloadAction<string>) => {
      const rarity = state.filters.rarity || [];
      const index = rarity.indexOf(action.payload);
      if (index === -1) {
        state.filters.rarity = [...rarity, action.payload];
      } else {
        state.filters.rarity = rarity.filter((r) => r !== action.payload);
      }
    },
  },
});

export const {
  setFilters,
  resetFilters,
  setQuery,
  addRecentSearch,
  clearRecentSearches,
  setViewMode,
  toggleColor,
  toggleRarity,
} = searchSlice.actions;

export default searchSlice.reducer;

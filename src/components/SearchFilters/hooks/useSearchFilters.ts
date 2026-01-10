import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  setFilters,
  resetFilters,
  toggleColor,
  toggleRarity,
  setQuery,
  clearRecentSearches,
} from '@/store/slices/searchSlice';
import type { SearchFilters } from '@/types/search';

/**
 * Custom hook to manage search filter state and actions
 */
export function useSearchFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search.filters);
  const recentSearches = useAppSelector((state) => state.search.recentSearches);

  // Handlers
  const handleColorToggle = useCallback(
    (color: string) => {
      dispatch(toggleColor(color));
    },
    [dispatch]
  );

  const handleRarityToggle = useCallback(
    (rarity: string) => {
      dispatch(toggleRarity(rarity));
    },
    [dispatch]
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      dispatch(setFilters({ type: type === 'all' ? undefined : type }));
    },
    [dispatch]
  );

  const handleSortChange = useCallback(
    (sort: string) => {
      dispatch(setFilters({ sortBy: sort as SearchFilters['sortBy'] }));
    },
    [dispatch]
  );

  const handleFormatChange = useCallback(
    (format: string) => {
      dispatch(setFilters({ format: format === 'all' ? undefined : format }));
    },
    [dispatch]
  );

  const handleReset = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const handleApplyFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleKeywordToggle = useCallback(
    (keyword: string) => {
      const current = filters.keywords || [];
      const isSelected = current.includes(keyword);
      dispatch(
        setFilters({
          keywords: isSelected
            ? current.filter((k) => k !== keyword)
            : [...current, keyword],
        })
      );
    },
    [dispatch, filters.keywords]
  );

  const handleRangeChange = useCallback(
    (
      field: 'cmc' | 'power' | 'toughness' | 'priceRange',
      type: 'min' | 'max',
      value: string
    ) => {
      const currentRange = filters[field] || {};
      dispatch(
        setFilters({
          [field]: {
            ...currentRange,
            [type]: value ? Number(value) : undefined,
          },
        })
      );
    },
    [dispatch, filters]
  );

  const handleQuerySelect = useCallback(
    (query: string) => {
      dispatch(setQuery(query));
    },
    [dispatch]
  );

  const handleClearRecentSearches = useCallback(() => {
    dispatch(clearRecentSearches());
  }, [dispatch]);

  // Computed values
  const activeFiltersCount = useMemo(() => {
    return (
      (filters.colors?.length || 0) +
      (filters.rarity?.length || 0) +
      (filters.type ? 1 : 0) +
      (filters.cmc?.min !== undefined || filters.cmc?.max !== undefined ? 1 : 0) +
      (filters.power?.min !== undefined || filters.power?.max !== undefined ? 1 : 0) +
      (filters.toughness?.min !== undefined || filters.toughness?.max !== undefined ? 1 : 0) +
      (filters.keywords?.length || 0) +
      (filters.format ? 1 : 0) +
      (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined ? 1 : 0)
    );
  }, [filters]);

  const isColorSelected = useCallback(
    (color: string) => filters.colors?.includes(color) ?? false,
    [filters.colors]
  );

  const isRaritySelected = useCallback(
    (rarity: string) => filters.rarity?.includes(rarity) ?? false,
    [filters.rarity]
  );

  const isKeywordSelected = useCallback(
    (keyword: string) => filters.keywords?.includes(keyword) ?? false,
    [filters.keywords]
  );

  return {
    // State
    filters,
    recentSearches,
    activeFiltersCount,

    // Handlers
    handleColorToggle,
    handleRarityToggle,
    handleTypeChange,
    handleSortChange,
    handleFormatChange,
    handleReset,
    handleApplyFilters,
    handleKeywordToggle,
    handleRangeChange,
    handleQuerySelect,
    handleClearRecentSearches,

    // Selectors
    isColorSelected,
    isRaritySelected,
    isKeywordSelected,
  };
}

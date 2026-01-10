/**
 * Tailwind style definitions for SearchFilters component
 */

export const styles = {
  // Container
  container: 'space-y-4',

  // Active Filters Banner
  activeFiltersBanner: 'bg-primary/10 border border-primary/20 rounded-lg p-3',
  activeFiltersContent: 'flex items-center justify-between',
  activeFiltersText: 'text-sm font-semibold text-primary',
  clearAllButton: 'h-6 text-xs transition-all duration-200 hover:text-primary hover:scale-105 active:scale-95',

  // Recent Searches
  recentSearchesContainer: 'bg-muted/30 rounded-lg p-3',
  recentSearchesButton: 'flex items-center justify-between w-full text-sm font-semibold mb-2 hover:text-primary transition-colors',
  recentSearchesLabel: 'flex items-center gap-2',
  recentSearchesList: 'space-y-2 mt-2',
  recentSearchItem: 'flex items-center justify-between bg-background rounded px-2 py-1.5 text-xs transition-all duration-200 hover:bg-accent hover:translate-x-1 cursor-pointer group',
  clearHistoryButton: 'w-full h-6 text-xs text-muted-foreground transition-all duration-200 hover:text-destructive hover:scale-105 active:scale-95',

  // Section Headers
  sectionHeader: 'text-sm font-semibold mb-2',
  sectionHeaderWithIcon: 'text-sm font-semibold mb-2 flex items-center gap-2',

  // Quick Filters
  quickFiltersGrid: 'flex flex-wrap gap-2',
  quickFilterBadge: 'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95',
  quickFilterBombs: 'hover:bg-violet-500/20 hover:border-violet-500',
  quickFilterInstants: 'hover:bg-blue-500/20 hover:border-blue-500',
  quickFilterLowCost: 'hover:bg-green-500/20 hover:border-green-500',
  quickFilterPlaneswalkers: 'hover:bg-amber-500/20 hover:border-amber-500',

  // Color Buttons
  colorButtonsGrid: 'flex flex-wrap gap-2',
  colorButton: 'w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center text-sm font-bold hover:shadow-lg active:scale-90',
  colorButtonSelected: 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg',
  colorButtonUnselected: 'opacity-70 hover:opacity-100 hover:scale-110',

  // Rarity Badges
  rarityBadgesGrid: 'flex flex-wrap gap-2',
  rarityBadge: 'cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95',
  rarityBadgeSelected: 'ring-2 ring-primary ring-offset-1 shadow-md',

  // Keyword Badges
  keywordBadgesGrid: 'flex flex-wrap gap-2',
  keywordBadge: 'cursor-pointer transition-all duration-200 text-xs hover:scale-105 hover:shadow-md active:scale-95',
  keywordBadgeSelected: 'ring-2 ring-primary ring-offset-1 shadow-md',

  // Range Inputs
  rangeInputContainer: 'flex items-center gap-2',
  rangeInput: 'w-20 h-8',
  rangeSeparator: 'text-muted-foreground',

  // Select Inputs
  selectTrigger: 'w-full transition-all duration-200 hover:border-primary',
  selectTriggerSmall: 'w-full h-8 text-xs transition-all duration-200 hover:border-primary',

  // Reset Button
  resetButton: 'w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',

  // Icon sizes
  iconSmall: 'w-4 h-4',
  iconWithMargin: 'w-4 h-4 mr-2',
} as const;

// Mana color style mappings
export const manaColorClasses: Record<string, string> = {
  W: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 hover:border-amber-400 hover:shadow-amber-200/50',
  U: 'bg-blue-500 text-white border-blue-600 hover:bg-blue-400 hover:border-blue-500 hover:shadow-blue-400/50',
  B: 'bg-zinc-800 text-white border-zinc-900 hover:bg-zinc-700 hover:border-zinc-800 hover:shadow-zinc-600/50',
  R: 'bg-red-500 text-white border-red-600 hover:bg-red-400 hover:border-red-500 hover:shadow-red-400/50',
  G: 'bg-green-600 text-white border-green-700 hover:bg-green-500 hover:border-green-600 hover:shadow-green-400/50',
  C: 'bg-zinc-300 text-zinc-800 border-zinc-400 hover:bg-zinc-200 hover:border-zinc-300 hover:shadow-zinc-300/50',
};

// Rarity color style mappings
export const rarityColorClasses: Record<string, string> = {
  common: 'border-zinc-400 hover:bg-zinc-400/20 hover:border-zinc-500',
  uncommon: 'border-slate-400 hover:bg-slate-400/20 hover:border-slate-500',
  rare: 'border-amber-500 hover:bg-amber-500/20 hover:border-amber-400',
  mythic: 'border-orange-600 hover:bg-orange-600/20 hover:border-orange-500',
};

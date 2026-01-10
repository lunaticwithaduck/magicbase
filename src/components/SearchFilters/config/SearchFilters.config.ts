import type { SearchFilters } from '@/types/search';

/**
 * Quick filter presets for common search patterns
 */
export interface QuickFilter {
  id: string;
  label: string;
  icon: string;
  filters: Partial<SearchFilters>;
  hoverClass: string;
}

export const QUICK_FILTERS: QuickFilter[] = [
  {
    id: 'bombs',
    label: 'Bombs',
    icon: '✨',
    filters: { type: 'Creature', rarity: ['mythic', 'rare'] },
    hoverClass: 'hover:bg-violet-500/20 hover:border-violet-500',
  },
  {
    id: 'instants',
    label: 'Instants',
    icon: '⚡',
    filters: { type: 'Instant' },
    hoverClass: 'hover:bg-blue-500/20 hover:border-blue-500',
  },
  {
    id: 'low-cost',
    label: 'Low Cost',
    icon: '🏃',
    filters: { cmc: { max: 2 } },
    hoverClass: 'hover:bg-green-500/20 hover:border-green-500',
  },
  {
    id: 'planeswalkers',
    label: 'Planeswalkers',
    icon: '👑',
    filters: { type: 'Planeswalker' },
    hoverClass: 'hover:bg-amber-500/20 hover:border-amber-500',
  },
  {
    id: 'removal',
    label: 'Removal',
    icon: '💀',
    filters: { query: 'o:destroy OR o:exile' },
    hoverClass: 'hover:bg-red-500/20 hover:border-red-500',
  },
  {
    id: 'card-draw',
    label: 'Card Draw',
    icon: '📚',
    filters: { query: 'o:"draw a card" OR o:"draw cards"' },
    hoverClass: 'hover:bg-cyan-500/20 hover:border-cyan-500',
  },
];

/**
 * Filter section configuration for dynamic rendering
 */
export interface FilterSection {
  id: string;
  title: string;
  icon?: string;
}

export const FILTER_SECTIONS: FilterSection[] = [
  { id: 'colors', title: 'Colors' },
  { id: 'type', title: 'Card Type' },
  { id: 'rarity', title: 'Rarity' },
  { id: 'cmc', title: 'Mana Value' },
  { id: 'keywords', title: 'Keywords', icon: 'sparkles' },
  { id: 'format', title: 'Format', icon: 'scale' },
  { id: 'price', title: 'Price Range (USD)', icon: 'dollar' },
  { id: 'sort', title: 'Sort By' },
];

export interface SearchFilters {
  query: string;
  colors?: string[];
  colorMatch?: 'exact' | 'include' | 'atMost';
  type?: string;
  rarity?: string[];
  set?: string;
  cmc?: { min?: number; max?: number };
  power?: { min?: number; max?: number };
  toughness?: { min?: number; max?: number };
  format?: string;
  isLegal?: boolean;
  keywords?: string[];
  priceRange?: { min?: number; max?: number };
  sortBy?: SortOption;
  sortDirection?: 'asc' | 'desc';
}

export type SortOption =
  | 'name'
  | 'released'
  | 'set'
  | 'rarity'
  | 'color'
  | 'usd'
  | 'cmc'
  | 'power'
  | 'toughness'
  | 'edhrec'
  | 'penny';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'released', label: 'Release Date' },
  { value: 'set', label: 'Set' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'color', label: 'Color' },
  { value: 'usd', label: 'Price (USD)' },
  { value: 'cmc', label: 'Mana Value' },
  { value: 'power', label: 'Power' },
  { value: 'toughness', label: 'Toughness' },
  { value: 'edhrec', label: 'EDHREC Rank' },
];

export const COLOR_OPTIONS = [
  { value: 'W', label: 'White', symbol: '☀️' },
  { value: 'U', label: 'Blue', symbol: '💧' },
  { value: 'B', label: 'Black', symbol: '💀' },
  { value: 'R', label: 'Red', symbol: '🔥' },
  { value: 'G', label: 'Green', symbol: '🌲' },
  { value: 'C', label: 'Colorless', symbol: '◇' },
];

export const RARITY_OPTIONS = [
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'mythic', label: 'Mythic Rare' },
];

export const TYPE_OPTIONS = [
  'Creature',
  'Instant',
  'Sorcery',
  'Enchantment',
  'Artifact',
  'Planeswalker',
  'Land',
  'Battle',
];

export const KEYWORD_OPTIONS = [
  { value: 'flying', label: 'Flying', icon: '🦅' },
  { value: 'trample', label: 'Trample', icon: '🦏' },
  { value: 'haste', label: 'Haste', icon: '⚡' },
  { value: 'vigilance', label: 'Vigilance', icon: '👁️' },
  { value: 'lifelink', label: 'Lifelink', icon: '❤️' },
  { value: 'deathtouch', label: 'Deathtouch', icon: '☠️' },
  { value: 'first strike', label: 'First Strike', icon: '⚔️' },
  { value: 'double strike', label: 'Double Strike', icon: '⚔️⚔️' },
  { value: 'hexproof', label: 'Hexproof', icon: '🛡️' },
  { value: 'indestructible', label: 'Indestructible', icon: '💎' },
  { value: 'menace', label: 'Menace', icon: '👻' },
  { value: 'flash', label: 'Flash', icon: '✨' },
];

export const FORMAT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'pioneer', label: 'Pioneer' },
  { value: 'modern', label: 'Modern' },
  { value: 'legacy', label: 'Legacy' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'commander', label: 'Commander' },
  { value: 'pauper', label: 'Pauper' },
  { value: 'historic', label: 'Historic' },
];

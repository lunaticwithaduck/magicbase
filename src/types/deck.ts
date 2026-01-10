import type { ScryfallCard } from './card';

export interface DeckCard {
  card: ScryfallCard;
  quantity: number;
  isSideboard: boolean;
  isCommander?: boolean;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  format: DeckFormat;
  cards: DeckCard[];
  coverCard?: ScryfallCard;
  createdAt: string;
  updatedAt: string;
  colorIdentity: string[];
}

export type DeckFormat =
  | 'standard'
  | 'pioneer'
  | 'modern'
  | 'legacy'
  | 'vintage'
  | 'commander'
  | 'pauper'
  | 'historic'
  | 'explorer'
  | 'brawl'
  | 'casual';

export interface DeckStats {
  totalCards: number;
  mainboardCount: number;
  sideboardCount: number;
  averageCmc: number;
  colorDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  rarityDistribution: Record<string, number>;
  manaCurve: Record<number, number>;
}

export const FORMAT_LABELS: Record<DeckFormat, string> = {
  standard: 'Standard',
  pioneer: 'Pioneer',
  modern: 'Modern',
  legacy: 'Legacy',
  vintage: 'Vintage',
  commander: 'Commander',
  pauper: 'Pauper',
  historic: 'Historic',
  explorer: 'Explorer',
  brawl: 'Brawl',
  casual: 'Casual',
};

export const FORMAT_MIN_CARDS: Record<DeckFormat, number> = {
  standard: 60,
  pioneer: 60,
  modern: 60,
  legacy: 60,
  vintage: 60,
  commander: 100,
  pauper: 60,
  historic: 60,
  explorer: 60,
  brawl: 60,
  casual: 60,
};

export const DISPLAY_FORMATS = [
  'standard',
  'pioneer', 
  'modern',
  'legacy',
  'vintage',
  'commander',
  'pauper',
] as const;

export type DisplayFormat = typeof DISPLAY_FORMATS[number];

export interface LegalityDisplay {
  label: string;
  variant: 'default' | 'secondary' | 'destructive';
}

export function formatLegality(legality: string): LegalityDisplay {
  switch (legality) {
    case 'legal':
      return { label: 'Legal', variant: 'default' };
    case 'not_legal':
      return { label: 'Not Legal', variant: 'secondary' };
    case 'banned':
      return { label: 'Banned', variant: 'destructive' };
    case 'restricted':
      return { label: 'Restricted', variant: 'secondary' };
    default:
      return { label: legality, variant: 'secondary' };
  }
}

export const PURCHASE_LINKS = [
  {
    id: 'tcgplayer',
    label: 'TCGPlayer',
    uriKey: 'tcgplayer' as const,
    buttonClass: 'border-orange-500/50 hover:bg-orange-500/10 hover:border-orange-500',
    icon: 'shopping-cart',
  },
  {
    id: 'cardmarket',
    label: 'Cardmarket',
    uriKey: 'cardmarket' as const,
    buttonClass: 'border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500',
    icon: 'external-link',
  },
] as const;

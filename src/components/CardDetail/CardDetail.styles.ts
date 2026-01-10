export const styles = {
  // Dialog
  dialogContent: 'max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden',
  scrollArea: 'max-h-[90vh]',
  contentWrapper: 'p-6 md:p-8',
  
  // Header
  header: 'mb-6',
  title: 'flex items-center gap-3 text-2xl md:text-3xl',
  
  // Layout
  gridLayout: 'grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 md:gap-10',
  
  // Card Image Section
  imageSection: 'flex flex-col items-center',
  addToDeckButton: 'w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]',
  
  // Purchase Section
  purchaseSection: 'w-full mt-3 space-y-2',
  purchaseLabel: 'text-xs text-muted-foreground text-center font-medium uppercase tracking-wider',
  purchaseGrid: 'grid grid-cols-2 gap-2',
  tcgPlayerButton: 'border-orange-500/50 transition-all duration-200 hover:bg-orange-500/10 hover:border-orange-500 hover:scale-105 hover:shadow-md active:scale-95',
  cardmarketButton: 'border-blue-500/50 transition-all duration-200 hover:bg-blue-500/10 hover:border-blue-500 hover:scale-105 hover:shadow-md active:scale-95',
  
  // Details Section
  detailsSection: 'space-y-6',
  
  // Section Headers
  sectionHeader: 'text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider',
  sectionHeaderSmall: 'text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider',
  
  // Type Line
  typeLine: 'text-xl font-medium',
  
  // Oracle Text
  oracleText: 'text-base whitespace-pre-wrap leading-relaxed bg-secondary/30 p-4 rounded-lg',
  
  // Flavor Text
  flavorText: 'text-base italic text-muted-foreground border-l-4 border-amber-500/50 pl-4',
  
  // Stats
  statsGrid: 'grid grid-cols-3 gap-4',
  statBox: 'bg-secondary/20 rounded-lg p-4 transition-all duration-200 hover:bg-secondary/30',
  statValue: 'text-2xl font-mono font-bold',
  
  // Set Info
  setInfo: 'flex flex-wrap items-center gap-2',
  setInfoText: 'text-sm text-muted-foreground',
  
  // Prices
  pricesGrid: 'grid grid-cols-2 gap-3',
  priceBox: 'bg-secondary/30 rounded-lg p-3 transition-all duration-200 hover:bg-secondary/40',
  priceLabel: 'text-xs text-muted-foreground mb-1 flex items-center gap-1',
  priceValues: 'flex gap-3',
  priceNormal: 'font-semibold text-green-400',
  priceFoil: 'font-semibold text-amber-400',
  
  // Legality
  legalityGrid: 'grid grid-cols-3 lg:grid-cols-4 gap-3',
  legalityItem: 'flex flex-col gap-1 transition-all duration-200 hover:scale-105',
  legalityFormat: 'text-xs font-semibold capitalize text-muted-foreground',
  legalityBadge: 'text-xs justify-center',
  
  // Rulings
  rulingsContainer: 'space-y-3 max-h-96 overflow-y-auto',
  rulingItem: 'bg-secondary/20 rounded-lg p-3 border border-border/30 transition-all duration-200 hover:bg-secondary/30 hover:border-border/50',
  rulingDate: 'text-xs text-muted-foreground mb-1 font-semibold',
  rulingComment: 'text-sm leading-relaxed',
  
  // Icons
  iconSmall: 'w-3 h-3 mr-1.5',
  iconMedium: 'w-4 h-4 mr-2',
  
  // Animation
  motionLeft: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 } },
  motionRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 } },
} as const;

// Rarity color mappings
export const rarityColors: Record<string, string> = {
  common: 'bg-zinc-600',
  uncommon: 'bg-zinc-400',
  rare: 'bg-amber-500',
  mythic: 'bg-orange-600',
  special: 'bg-purple-500',
  bonus: 'bg-purple-500',
};

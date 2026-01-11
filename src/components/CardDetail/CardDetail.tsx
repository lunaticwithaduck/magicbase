import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ScryfallCard } from '@/types/card';
import { CardImage } from '@/components/CardImage/CardImage';
import { CardSynergies } from '@/components/CardSynergies/CardSynergies';
import { CommanderDecks } from '@/components/CommanderDecks/CommanderDecks';
import { ManaCost } from '@/components/ManaSymbol/ManaSymbol';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCardRulingsQuery } from '@/api/scryfallApi';
import { Plus, ExternalLink, ShoppingCart, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardDetailProps {
  card: ScryfallCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToDeck?: (card: ScryfallCard) => void;
}

const rarityColors: Record<string, string> = {
  common: 'bg-zinc-600',
  uncommon: 'bg-zinc-400',
  rare: 'bg-amber-500',
  mythic: 'bg-orange-600',
  special: 'bg-purple-500',
  bonus: 'bg-purple-500',
};

const formatLegality = (legality: string): { label: string; variant: 'default' | 'secondary' | 'destructive' } => {
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
};

export function CardDetail({ card, open, onOpenChange, onAddToDeck }: CardDetailProps) {
  // Card history stack for back navigation
  const [cardHistory, setCardHistory] = useState<ScryfallCard[]>([]);
  const [currentCard, setCurrentCard] = useState<ScryfallCard | null>(null);

  // Sync currentCard with prop when dialog opens/closes or card changes
  const displayCard = currentCard || card;
  
  const handleSynergyCardClick = useCallback((newCard: ScryfallCard) => {
    if (displayCard) {
      setCardHistory(prev => [...prev, displayCard]);
    }
    setCurrentCard(newCard);
  }, [displayCard]);

  const handleBack = useCallback(() => {
    if (cardHistory.length > 0) {
      const prevCard = cardHistory[cardHistory.length - 1];
      setCardHistory(prev => prev.slice(0, -1));
      setCurrentCard(prevCard);
    }
  }, [cardHistory]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      // Reset history when closing
      setCardHistory([]);
      setCurrentCard(null);
    }
    onOpenChange(isOpen);
  }, [onOpenChange]);

  const { data: rulingsData } = useGetCardRulingsQuery(displayCard?.id ?? '', {
    skip: !displayCard,
  });

  if (!displayCard) return null;

  const rulings = rulingsData?.data || [];
  const formats = ['standard', 'pioneer', 'modern', 'legacy', 'vintage', 'commander', 'pauper'] as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6 md:p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="flex items-center gap-3 text-2xl md:text-3xl">
                {cardHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBack}
                    className="h-8 w-8 mr-1 hover:bg-secondary"
                    title="Go back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                {displayCard.name}
                <ManaCost cost={displayCard.mana_cost} size="lg" />
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-6 md:gap-10">
              {/* Card Image */}
              <motion.div
                key={displayCard.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                <CardImage card={displayCard} size="xl" showOverlay={false} />
                
                {onAddToDeck && (
                  <Button
                    onClick={() => onAddToDeck(displayCard)}
                    className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Deck
                  </Button>
                )}

                {/* Purchase Links */}
                <div className="w-full mt-3 space-y-2">
                  <p className="text-xs text-muted-foreground text-center font-medium uppercase tracking-wider">Buy this card</p>
                  <div className="grid grid-cols-2 gap-2">
                    {displayCard.purchase_uris?.tcgplayer && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500/50 hover:bg-orange-500/10 hover:border-orange-500"
                        asChild
                      >
                        <a href={displayCard.purchase_uris.tcgplayer} target="_blank" rel="noopener noreferrer">
                          <ShoppingCart className="w-3 h-3 mr-1.5" />
                          TCGPlayer
                        </a>
                      </Button>
                    )}
                    {displayCard.purchase_uris?.cardmarket && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/50 hover:bg-blue-500/10 hover:border-blue-500"
                        asChild
                      >
                        <a href={displayCard.purchase_uris.cardmarket} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1.5" />
                          Cardmarket
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Card Details */}
              <motion.div
                key={`details-${displayCard.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Type Line */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Type</h3>
                  <p className="text-xl font-medium">{displayCard.type_line}</p>
                </div>

                {/* Oracle Text */}
                {displayCard.oracle_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Oracle Text</h3>
                    <p className="text-base whitespace-pre-wrap leading-relaxed bg-secondary/30 p-4 rounded-lg">{displayCard.oracle_text}</p>
                  </div>
                )}

                {/* Flavor Text */}
                {displayCard.flavor_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Flavor Text</h3>
                    <p className="text-base italic text-muted-foreground border-l-4 border-amber-500/50 pl-4">{displayCard.flavor_text}</p>
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4">
                  {(displayCard.power || displayCard.toughness) && (
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">P/T</h3>
                      <p className="text-2xl font-mono font-bold">{displayCard.power}/{displayCard.toughness}</p>
                    </div>
                  )}
                  {displayCard.loyalty && (
                    <div className="bg-secondary/20 rounded-lg p-4">
                      <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Loyalty</h3>
                      <p className="text-2xl font-mono font-bold">{displayCard.loyalty}</p>
                    </div>
                  )}
                  <div className="bg-secondary/20 rounded-lg p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Mana Value</h3>
                    <p className="text-2xl font-mono font-bold">{displayCard.cmc}</p>
                  </div>
                </div>

                {/* Set Info */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn(rarityColors[displayCard.rarity], 'capitalize')}>
                    {displayCard.rarity}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {displayCard.set_name} ({displayCard.set.toUpperCase()}) #{displayCard.collector_number}
                  </span>
                </div>

                {/* Prices */}
                {(displayCard.prices.usd || displayCard.prices.usd_foil || displayCard.prices.eur || displayCard.prices.eur_foil) && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Prices</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {/* USD Prices */}
                      {(displayCard.prices.usd || displayCard.prices.usd_foil) && (
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <span className="text-orange-400">🇺🇸</span> USD (TCGPlayer)
                          </p>
                          <div className="flex gap-3">
                            {displayCard.prices.usd && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Normal:</span>{' '}
                                <span className="font-semibold text-green-400">${displayCard.prices.usd}</span>
                              </div>
                            )}
                            {displayCard.prices.usd_foil && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Foil:</span>{' '}
                                <span className="font-semibold text-amber-400">${displayCard.prices.usd_foil}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* EUR Prices */}
                      {(displayCard.prices.eur || displayCard.prices.eur_foil) && (
                        <div className="bg-secondary/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <span className="text-blue-400">🇪🇺</span> EUR (Cardmarket)
                          </p>
                          <div className="flex gap-3">
                            {displayCard.prices.eur && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Normal:</span>{' '}
                                <span className="font-semibold text-green-400">€{displayCard.prices.eur}</span>
                              </div>
                            )}
                            {displayCard.prices.eur_foil && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Foil:</span>{' '}
                                <span className="font-semibold text-amber-400">€{displayCard.prices.eur_foil}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Legalities */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Format Legality</h3>
                  <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                    {formats.map((format) => {
                      const { label, variant } = formatLegality(displayCard.legalities[format]);
                      return (
                        <div key={format} className="flex flex-col gap-1">
                          <span className="text-xs font-semibold capitalize text-muted-foreground">{format}</span>
                          <Badge variant={variant} className="text-xs justify-center">
                            {label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rulings */}
                {rulings.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Rulings ({rulings.length})</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {rulings.map((ruling, index) => (
                          <div key={index} className="bg-secondary/20 rounded-lg p-3 border border-border/30">
                            <p className="text-xs text-muted-foreground mb-1 font-semibold">{ruling.published_at}</p>
                            <p className="text-sm leading-relaxed">{ruling.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </div>

            {/* Synergies & Commander Decks - Always show */}
            <Separator className="my-6" />
            <CardSynergies 
              key={displayCard.id}
              cardName={displayCard.name} 
              onCardClick={handleSynergyCardClick}
            />

            {/* Commander Decks Section - Only for legendary creatures */}
            <Separator className="my-6" />
            <CommanderDecks key={`decks-${displayCard.id}`} card={displayCard} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

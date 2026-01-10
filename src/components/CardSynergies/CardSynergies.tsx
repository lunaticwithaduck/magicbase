import { motion } from 'framer-motion';
import { useGetCardSynergiesQuery, selectHighSynergyCards, type EDHRECSynergyCard } from '@/api/edhrecApi';
import { useLazyGetCardByNameQuery } from '@/api/scryfallApi';
import type { ScryfallCard } from '@/types/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardSynergiesProps {
  cardName: string;
  onCardClick?: (card: ScryfallCard) => void;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

function SynergyCard({ 
  card, 
  onCardClick,
}: { 
  card: EDHRECSynergyCard; 
  onCardClick?: (card: ScryfallCard) => void;
}) {
  const [fetchCard, { isLoading }] = useLazyGetCardByNameQuery();

  const handleClick = async () => {
    if (!onCardClick) return;
    try {
      const result = await fetchCard({ name: card.name, exact: true }).unwrap();
      onCardClick(result);
    } catch (error) {
      // Try fuzzy match if exact fails
      try {
        const fuzzyResult = await fetchCard({ name: card.name, exact: false }).unwrap();
        onCardClick(fuzzyResult);
      } catch {
        console.error('Could not fetch card:', card.name);
      }
    }
  };

  // Format synergy as percentage - can be positive or negative
  const synergyPercent = card.synergy !== undefined 
    ? `${card.synergy >= 0 ? '+' : ''}${(card.synergy * 100).toFixed(0)}%` 
    : null;
  
  const isPositiveSynergy = (card.synergy ?? 0) >= 0;

  return (
    <motion.div
      variants={item}
      className={cn(
        "relative group cursor-pointer rounded-lg overflow-hidden bg-secondary/30",
        "transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/20",
        "hover:ring-2 hover:ring-primary/50",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onClick={handleClick}
    >
      {/* Card Image */}
      <div className="aspect-[488/680] relative">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback placeholder
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 680"><rect fill="%23374151" width="488" height="680"/><text x="244" y="340" text-anchor="middle" fill="%239CA3AF" font-size="24">🃏</text></svg>';
          }}
        />
        
        {/* Synergy Score Badge */}
        {synergyPercent && (
          <Badge 
            className={cn(
              "absolute top-1 right-1 text-white text-[10px] px-1.5 py-0.5 font-bold",
              isPositiveSynergy ? "bg-green-600/90" : "bg-zinc-600/90"
            )}
          >
            {synergyPercent}
          </Badge>
        )}

        {/* Hover overlay with name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
          <span className="text-white text-[10px] font-medium truncate w-full">
            {card.name}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function CardSynergies({ cardName, onCardClick, className }: CardSynergiesProps) {
  const { data, isLoading, isError } = useGetCardSynergiesQuery(cardName, {
    skip: !cardName,
  });
  
  const allSynergyCards = selectHighSynergyCards(data);
  
  // Show all cards, let SynergyCard handle the visual filtering
  const synergyCards = allSynergyCards;

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Strong Synergies
          </h3>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[488/680] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Strong Synergies
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm bg-secondary/30 rounded-lg p-4">
          <AlertCircle className="w-4 h-4" />
          <span>Synergy data not available for this card</span>
        </div>
      </div>
    );
  }

  if (synergyCards.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Strong Synergies
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No synergy data found for this card.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Strong Synergies
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            via EDHREC
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground hover:text-primary"
          onClick={() => {
            const sanitized = cardName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            window.open(`https://edhrec.com/cards/${sanitized}`, '_blank');
          }}
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          View on EDHREC
        </Button>
      </div>

      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {synergyCards.map((card) => (
          <SynergyCard 
            key={card.name} 
            card={card} 
            onCardClick={onCardClick}
          />
        ))}
      </motion.div>
    </div>
  );
}

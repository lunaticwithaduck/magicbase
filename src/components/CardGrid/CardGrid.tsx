import { motion } from 'framer-motion';
import type { ScryfallCard } from '@/types/card';
import { CardImage } from '@/components/CardImage/CardImage';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardGridProps {
  cards: ScryfallCard[];
  isLoading?: boolean;
  showQuickActions?: boolean;
  onCardClick?: (card: ScryfallCard) => void;
  onAddToDeck?: (card: ScryfallCard) => void;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function CardGrid({ cards, isLoading, showQuickActions = true, onCardClick, onAddToDeck, className }: CardGridProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4', className)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[488/680]">
            <Skeleton className="w-full h-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-6xl mb-4">🔮</span>
        <h3 className="text-xl font-semibold mb-2">No cards found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4', className)}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={item}>
          <CardImage
            card={card}
            size="md"
            showQuickActions={showQuickActions}
            onClick={() => onCardClick?.(card)}
            onAddToDeck={onAddToDeck}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

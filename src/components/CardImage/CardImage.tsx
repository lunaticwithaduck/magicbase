import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScryfallCard } from '@/types/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, ExternalLink } from 'lucide-react';

interface CardImageProps {
  card: ScryfallCard;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOverlay?: boolean;
  showQuickActions?: boolean;
  onClick?: () => void;
  onAddToDeck?: (card: ScryfallCard) => void;
  className?: string;
  enableTilt?: boolean;
}

const sizeClasses = {
  sm: 'w-[120px]',
  md: 'w-[200px]',
  lg: 'w-[300px]',
  xl: 'w-[380px]',
};

const getImageUrl = (
  card: ScryfallCard,
  size: CardImageProps['size'],
  faceIndex: number = 0
): string | undefined => {
  const imageSize = size === 'xl' || size === 'lg' ? 'large' : 'normal';

  if (card.card_faces && card.card_faces.length > 1) {
    const face = card.card_faces[faceIndex];
    return face.image_uris?.[imageSize];
  }

  return card.image_uris?.[imageSize];
};

const hasMultipleFaces = (card: ScryfallCard): boolean => {
  return (
    card.card_faces !== undefined &&
    card.card_faces.length > 1 &&
    card.card_faces.every((face) => face.image_uris !== undefined)
  );
};

export function CardImage({
  card,
  size = 'md',
  showOverlay = true,
  showQuickActions = false,
  onClick,
  onAddToDeck,
  className,
  enableTilt = true,
}: CardImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentFace, setCurrentFace] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const imageUrl = getImageUrl(card, size, currentFace);
  const isDoubleFaced = hasMultipleFaces(card);
  const cardmarketUrl = card.purchase_uris?.cardmarket;
  const isRareOrMythic = card.rarity === 'rare' || card.rarity === 'mythic';

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleFlip = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFace((prev) => (prev === 0 ? 1 : 0));
    setIsLoading(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (y - 0.5) * 20,
      y: (x - 0.5) * -20,
    });
  }, [enableTilt]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleAddToDeck = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToDeck?.(card);
  }, [card, onAddToDeck]);

  const handleOpenCardmarket = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardmarketUrl) {
      window.open(cardmarketUrl, '_blank', 'noopener,noreferrer');
    }
  }, [cardmarketUrl]);

  return (
    <motion.div
      className={cn(
        'relative aspect-[488/680] rounded-[4.75%/3.5%] overflow-hidden bg-muted cursor-pointer group',
        sizeClasses[size],
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        transform: enableTilt ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined,
        transition: 'transform 0.1s ease-out',
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
    >
      {/* Holographic shine effect for rare/mythic cards */}
      {isRareOrMythic && isHovered && (
        <div 
          className="absolute inset-0 z-30 pointer-events-none opacity-40"
          style={{
            background: `linear-gradient(
              ${105 + tilt.y * 2}deg,
              transparent 20%,
              rgba(255, 255, 255, 0.3) 45%,
              rgba(255, 200, 100, 0.2) 50%,
              rgba(100, 200, 255, 0.2) 55%,
              rgba(255, 100, 200, 0.2) 60%,
              transparent 80%
            )`,
            mixBlendMode: 'overlay',
          }}
        />
      )}

      {/* Card glow effect */}
      <div 
        className={cn(
          "absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md",
          card.rarity === 'mythic' && "bg-gradient-to-r from-orange-500 via-red-500 to-orange-500",
          card.rarity === 'rare' && "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400",
          card.rarity === 'uncommon' && "bg-gradient-to-r from-slate-400 to-slate-300",
          card.rarity === 'common' && "bg-slate-500/30",
        )}
      />

      {isDoubleFaced && (
        <button
          onClick={handleFlip}
          title="Flip card"
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 hover:bg-black hover:scale-110 hover:rotate-180 active:scale-95"
        >
          ↻
        </button>
      )}

      <AnimatePresence mode="wait">
        {imageUrl && !hasError ? (
          <motion.img
            key={`${card.id}-${currentFace}`}
            src={imageUrl}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover"
            initial={{ rotateY: 90 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90 }}
            transition={{ duration: 0.2 }}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-secondary text-muted-foreground p-4 text-center">
            <span className="text-2xl mb-2">🃏</span>
            <span className="text-sm">{card.name}</span>
          </div>
        )}
      </AnimatePresence>

      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Skeleton className="w-full h-full" />
        </div>
      )}

      {/* Hover Overlay with Card Name and Quick Actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 z-10">
        {/* Card Name */}
        {showOverlay && (
          <span className="text-white text-sm font-medium truncate mb-2">
            {card.name}
          </span>
        )}

        {/* Quick Action Buttons - Always show both in a row */}
        {showQuickActions && (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToDeck}
              disabled={!onAddToDeck}
              className="flex-1 h-8 text-xs font-medium bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/80 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              title={onAddToDeck ? "Add to deck" : "Select a deck first"}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleOpenCardmarket}
              disabled={!cardmarketUrl}
              className="flex-1 h-8 text-xs font-medium bg-amber-600 text-white shadow-lg transition-all duration-200 hover:bg-amber-500 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              title="View on Cardmarket"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Buy
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

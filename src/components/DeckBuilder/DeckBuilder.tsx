import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ArrowLeftRight, GripVertical } from 'lucide-react';
import { useAppDispatch } from '@/store/store';
import {
  removeCardFromDeck,
  updateCardQuantity,
  moveCardToSideboard,
  moveCardToMainboard,
} from '@/store/slices/decksSlice';
import type { Deck, DeckCard } from '@/types/deck';
import type { ScryfallCard } from '@/types/card';
import { ManaCost } from '@/components/ManaSymbol/ManaSymbol';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useDeckStats } from '@/hooks/useDeckStats';

interface DeckBuilderProps {
  deck: Deck;
  onCardClick?: (card: ScryfallCard) => void;
}

interface DeckCardItemProps {
  deckCard: DeckCard;
  deckId: string;
  onCardClick?: (card: ScryfallCard) => void;
}

function DeckCardItem({ deckCard, deckId, onCardClick }: DeckCardItemProps) {
  const dispatch = useAppDispatch();
  const { card, quantity, isSideboard } = deckCard;

  const handleIncrement = () => {
    dispatch(updateCardQuantity({ deckId, cardId: card.id, isSideboard, quantity: quantity + 1 }));
  };

  const handleDecrement = () => {
    dispatch(updateCardQuantity({ deckId, cardId: card.id, isSideboard, quantity: quantity - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeCardFromDeck({ deckId, cardId: card.id, isSideboard, removeAll: true }));
  };

  const handleMove = () => {
    if (isSideboard) {
      dispatch(moveCardToMainboard({ deckId, cardId: card.id }));
    } else {
      dispatch(moveCardToSideboard({ deckId, cardId: card.id }));
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 group"
    >
      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onCardClick?.(card)}
              className="flex-1 flex items-center gap-2 text-left min-w-0"
            >
              <span className="font-mono text-sm text-muted-foreground w-6">
                {quantity}x
              </span>
              <span className="truncate text-sm font-medium">{card.name}</span>
              <ManaCost cost={card.mana_cost} size="sm" className="ml-auto shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="p-0">
            <img
              src={card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small}
              alt={card.name}
              className="rounded-lg"
              width={146}
              height={204}
            />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleDecrement}>
          <Minus className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleIncrement}>
          <Plus className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleMove} title={isSideboard ? 'Move to mainboard' : 'Move to sideboard'}>
          <ArrowLeftRight className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={handleRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

interface CardTypeGroupProps {
  type: string;
  cards: DeckCard[];
  deckId: string;
  onCardClick?: (card: ScryfallCard) => void;
}

function CardTypeGroup({ type, cards, deckId, onCardClick }: CardTypeGroupProps) {
  const totalCount = cards.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center justify-between">
        {type}
        <Badge variant="secondary" className="ml-2">
          {totalCount}
        </Badge>
      </h4>
      <AnimatePresence>
        {cards.map((deckCard) => (
          <DeckCardItem
            key={deckCard.card.id}
            deckCard={deckCard}
            deckId={deckId}
            onCardClick={onCardClick}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function groupCardsByType(cards: DeckCard[]): Record<string, DeckCard[]> {
  const groups: Record<string, DeckCard[]> = {};
  const typeOrder = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land', 'Other'];

  cards.forEach((deckCard) => {
    const typeLine = deckCard.card.type_line.toLowerCase();
    let type = 'Other';

    for (const t of typeOrder) {
      if (typeLine.includes(t.toLowerCase())) {
        type = t;
        break;
      }
    }

    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(deckCard);
  });

  // Sort within each group by mana value then name
  Object.keys(groups).forEach((type) => {
    groups[type].sort((a, b) => {
      if (a.card.cmc !== b.card.cmc) return a.card.cmc - b.card.cmc;
      return a.card.name.localeCompare(b.card.name);
    });
  });

  // Return in type order
  const orderedGroups: Record<string, DeckCard[]> = {};
  typeOrder.forEach((type) => {
    if (groups[type]) {
      orderedGroups[type] = groups[type];
    }
  });

  return orderedGroups;
}

export function DeckBuilder({ deck, onCardClick }: DeckBuilderProps) {
  const stats = useDeckStats(deck.cards);
  const mainboard = deck.cards.filter((c) => !c.isSideboard);
  const sideboard = deck.cards.filter((c) => c.isSideboard);
  const mainboardGroups = groupCardsByType(mainboard);
  const sideboardGroups = groupCardsByType(sideboard);

  return (
    <div className="flex flex-col h-full">
      {/* Stats Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">{deck.name}</h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Cards:</span>{' '}
            <span className="font-medium">{stats.mainboardCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sideboard:</span>{' '}
            <span className="font-medium">{stats.sideboardCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Avg CMC:</span>{' '}
            <span className="font-medium">{stats.averageCmc}</span>
          </div>
        </div>

        {/* Mana Curve Mini Chart */}
        <div className="flex items-end gap-1 mt-3 h-12">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((cmc) => {
            const count = stats.manaCurve[cmc] || 0;
            const maxCount = Math.max(...Object.values(stats.manaCurve), 1);
            const height = (count / maxCount) * 100;

            return (
              <div key={cmc} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                />
                <span className="text-xs text-muted-foreground">
                  {cmc === 7 ? '7+' : cmc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card List */}
      <Tabs defaultValue="mainboard" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2" style={{ width: 'calc(100% - 2rem)' }}>
          <TabsTrigger value="mainboard">
            Mainboard ({stats.mainboardCount})
          </TabsTrigger>
          <TabsTrigger value="sideboard">
            Sideboard ({stats.sideboardCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mainboard" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {Object.entries(mainboardGroups).map(([type, cards]) => (
                <CardTypeGroup
                  key={type}
                  type={type}
                  cards={cards}
                  deckId={deck.id}
                  onCardClick={onCardClick}
                />
              ))}
              {mainboard.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No cards in mainboard</p>
                  <p className="text-sm">Search for cards to add them</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sideboard" className="flex-1 min-h-0 m-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              {Object.entries(sideboardGroups).map(([type, cards]) => (
                <CardTypeGroup
                  key={type}
                  type={type}
                  cards={cards}
                  deckId={deck.id}
                  onCardClick={onCardClick}
                />
              ))}
              {sideboard.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No cards in sideboard</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

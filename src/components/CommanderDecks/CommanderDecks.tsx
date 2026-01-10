import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScryfallCard } from '@/types/card';
import {
  useGetCommanderDataQuery,
  useGetCommanderDecksQuery,
  useGetAverageDeckQuery,
  useLazyGetDeckPreviewQuery,
  selectDeckThemes,
  selectSampleDecks,
  selectAllAverageDeckCardNames,
  type EDHRECSampleDeck,
} from '@/api/edhrecApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ExternalLink,
  Copy,
  Crown,
  Users,
  DollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface CommanderDecksProps {
  card: ScryfallCard;
}

// Check if a card can be a commander
function isCommander(card: ScryfallCard): boolean {
  const typeLine = card.type_line?.toLowerCase() || '';
  
  // Check if it's a legendary creature
  if (typeLine.includes('legendary') && typeLine.includes('creature')) {
    return true;
  }
  
  // Check for "can be your commander" in oracle text
  const oracleText = card.oracle_text?.toLowerCase() || '';
  if (oracleText.includes('can be your commander')) {
    return true;
  }
  
  // Check if it's a legendary planeswalker with "can be your commander"
  if (typeLine.includes('legendary') && typeLine.includes('planeswalker') && oracleText.includes('can be your commander')) {
    return true;
  }
  
  return false;
}

// Format price nicely
function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}

// Format salt score (competitiveness indicator)
function formatSalt(salt: number): string {
  if (salt < 30) return 'Casual';
  if (salt < 50) return 'Focused';
  if (salt < 70) return 'Optimized';
  return 'High Power';
}

function getSaltColor(salt: number): string {
  if (salt < 30) return 'bg-green-500';
  if (salt < 50) return 'bg-blue-500';
  if (salt < 70) return 'bg-amber-500';
  return 'bg-red-500';
}

// Deck card component
function DeckCard({
  deck,
  onViewDeck,
  isLoading,
}: {
  deck: EDHRECSampleDeck;
  onViewDeck: (urlhash: string) => void;
  isLoading: boolean;
}) {
  const totalCards =
    deck.creature +
    deck.instant +
    deck.sorcery +
    deck.artifact +
    deck.enchantment +
    deck.planeswalker +
    deck.land +
    1; // +1 for commander

  return (
    <motion.div variants={itemVariants}>
      <Card className="overflow-hidden hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {deck.savedate}
                </Badge>
                <Badge className={cn('text-xs text-white', getSaltColor(deck.salt))}>
                  {formatSalt(deck.salt)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                <span>Creatures: {deck.creature}</span>
                <span>Spells: {deck.instant + deck.sorcery}</span>
                <span>Artifacts: {deck.artifact}</span>
                <span>Lands: {deck.land}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-medium">{formatPrice(deck.price)}</div>
                <div className="text-xs text-muted-foreground">{totalCards} cards</div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewDeck(deck.urlhash)}
                disabled={isLoading}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CommanderDecks({ card }: CommanderDecksProps) {
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [showAllDecks, setShowAllDecks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState<string | null>(null);
  
  // Only fetch if the card is a commander
  const canBeCommander = isCommander(card);
  
  const { data: commanderData, isLoading: commanderLoading } = useGetCommanderDataQuery(
    card.name,
    { skip: !canBeCommander }
  );
  
  const { data: decksData, isLoading: decksLoading } = useGetCommanderDecksQuery(
    card.name,
    { skip: !canBeCommander }
  );
  
  const { data: avgDeckData, isLoading: avgDeckLoading } = useGetAverageDeckQuery(
    card.name,
    { skip: !canBeCommander }
  );

  const [getDeckPreview] = useLazyGetDeckPreviewQuery();
  
  const themes = useMemo(() => selectDeckThemes(commanderData), [commanderData]);
  const sampleDecks = useMemo(() => selectSampleDecks(decksData, showAllDecks ? 20 : 5), [decksData, showAllDecks]);
  const avgDeckCards = useMemo(() => selectAllAverageDeckCardNames(avgDeckData), [avgDeckData]);
  
  const displayedThemes = showAllThemes ? themes : themes.slice(0, 8);
  
  // Handle viewing a deck
  const handleViewDeck = async (urlhash: string) => {
    setLoadingDeck(urlhash);
    try {
      const preview = await getDeckPreview(urlhash).unwrap();
      if (preview.url) {
        window.open(preview.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to get deck preview:', error);
      // Fallback to EDHREC page
      window.open(`https://edhrec.com/deckpreview/${urlhash}`, '_blank');
    } finally {
      setLoadingDeck(null);
    }
  };
  
  // Copy average deck to clipboard
  const handleCopyDeck = async () => {
    if (avgDeckCards.length === 0) return;
    
    const deckText = [
      `1 ${card.name}`, // Commander
      '',
      ...avgDeckCards.map(name => `1 ${name}`),
    ].join('\n');
    
    try {
      await navigator.clipboard.writeText(deckText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy deck:', error);
    }
  };
  
  // Don't render anything if not a commander
  if (!canBeCommander) {
    return null;
  }
  
  const isLoading = commanderLoading || decksLoading || avgDeckLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
        <Skeleton className="h-24" />
      </div>
    );
  }
  
  const numDecks = decksData?.num_decks_avg || decksData?.table?.length || 0;
  const avgPrice = decksData?.avg_price || 0;
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Commander Decks</h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{numDecks.toLocaleString()} decks</span>
          </div>
          {avgPrice > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>~{formatPrice(avgPrice)} avg</span>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Deck Themes */}
      {themes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Popular Themes
            </h4>
            {themes.length > 8 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllThemes(!showAllThemes)}
                className="text-xs"
              >
                {showAllThemes ? (
                  <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                ) : (
                  <>Show All ({themes.length}) <ChevronDown className="h-3 w-3 ml-1" /></>
                )}
              </Button>
            )}
          </div>
          
          <motion.div 
            className="flex flex-wrap gap-2"
            variants={containerVariants}
          >
            <AnimatePresence mode="popLayout">
              {displayedThemes.map((theme) => (
                <motion.div
                  key={theme.slug}
                  variants={itemVariants}
                  layout
                >
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => {
                      window.open(
                        `https://edhrec.com/tags/${theme.slug}/${theme.commanderSlug}`,
                        '_blank'
                      );
                    }}
                  >
                    {theme.name}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
      
      {/* Average Deck */}
      {avgDeckCards.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Average Deck ({avgDeckCards.length + 1} cards)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyDeck}
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Decklist
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Based on the most popular cards across all {card.name} decks.
            </p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              onClick={() => {
                const sanitized = card.name
                  .split('//')[0]
                  .trim()
                  .toLowerCase()
                  .replace(/[',.:]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-');
                window.open(`https://edhrec.com/average-decks/${sanitized}`, '_blank');
              }}
            >
              View on EDHREC
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Sample Decks */}
      {sampleDecks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Recent Decks</h4>
            {decksData?.table && decksData.table.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllDecks(!showAllDecks)}
                className="text-xs"
              >
                {showAllDecks ? (
                  <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                ) : (
                  <>Show More <ChevronDown className="h-3 w-3 ml-1" /></>
                )}
              </Button>
            )}
          </div>
          
          <motion.div 
            className="space-y-2"
            variants={containerVariants}
          >
            <AnimatePresence mode="popLayout">
              {sampleDecks.map((deck) => (
                <DeckCard
                  key={deck.urlhash}
                  deck={deck}
                  onViewDeck={handleViewDeck}
                  isLoading={loadingDeck === deck.urlhash}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
      
      {/* Link to full EDHREC page */}
      <div className="pt-2 text-center">
        <Button
          variant="outline"
          onClick={() => {
            const sanitized = card.name
              .split('//')[0]
              .trim()
              .toLowerCase()
              .replace(/[',.:]/g, '')
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-');
            window.open(`https://edhrec.com/commanders/${sanitized}`, '_blank');
          }}
        >
          <Crown className="h-4 w-4 mr-2" />
          View Full Commander Page on EDHREC
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

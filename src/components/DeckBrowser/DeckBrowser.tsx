import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  useGetTopCommandersQuery,
  useGetCommanderDecksQuery,
  useGetAverageDeckQuery,
  useLazyGetDeckPreviewQuery,
  selectTopCommandersList,
  selectSampleDecks,
  selectAllAverageDeckCardNames,
  type EDHRECTopCommander,
  type EDHRECSampleDeck,
  type TopCommandersTimePeriod,
} from '@/api/edhrecApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown,
  ExternalLink,
  Copy,
  Check,
  Search,
  Users,
  DollarSign,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
  },
};

// Format numbers nicely
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Format price
function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}

// Get salt level label and color
function getSaltInfo(salt: number): { label: string; color: string } {
  if (salt < 30) return { label: 'Casual', color: 'bg-green-500' };
  if (salt < 50) return { label: 'Focused', color: 'bg-blue-500' };
  if (salt < 70) return { label: 'Optimized', color: 'bg-amber-500' };
  return { label: 'High Power', color: 'bg-red-500' };
}

// Commander Card Component
function CommanderCard({
  commander,
  onClick,
  rank,
}: {
  commander: EDHRECTopCommander;
  onClick: () => void;
  rank: number;
}) {
  return (
    <motion.div variants={itemVariants} layout>
      <Card
        className="overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
        onClick={onClick}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={commander.image}
            alt={commander.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <Badge className="bg-black/70 text-white">#{rank}</Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
            <h3 className="font-semibold text-white text-sm leading-tight mb-1">
              {commander.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-white/80">
              <Users className="h-3 w-3" />
              {formatNumber(commander.num_decks)} decks
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Sample Deck Card Component
function SampleDeckCard({
  deck,
  onView,
  isLoading,
}: {
  deck: EDHRECSampleDeck;
  onView: () => void;
  isLoading: boolean;
}) {
  const saltInfo = getSaltInfo(deck.salt);
  const totalCards =
    deck.creature + deck.instant + deck.sorcery + deck.artifact +
    deck.enchantment + deck.planeswalker + deck.land + 1;

  return (
    <motion.div variants={itemVariants}>
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{deck.savedate}</Badge>
                <Badge className={cn('text-xs text-white', saltInfo.color)}>
                  {saltInfo.label}
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
              <Button size="sm" variant="outline" onClick={onView} disabled={isLoading}>
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

// Commander Detail View
function CommanderDetail({
  commander,
  onBack,
}: {
  commander: EDHRECTopCommander;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [loadingDeck, setLoadingDeck] = useState<string | null>(null);

  const { data: decksData, isLoading: decksLoading } = useGetCommanderDecksQuery(commander.name);
  const { data: avgDeckData, isLoading: avgDeckLoading } = useGetAverageDeckQuery(commander.name);
  const [getDeckPreview] = useLazyGetDeckPreviewQuery();

  const sampleDecks = useMemo(() => selectSampleDecks(decksData, 20), [decksData]);
  const avgDeckCards = useMemo(() => selectAllAverageDeckCardNames(avgDeckData), [avgDeckData]);

  const handleViewDeck = async (urlhash: string) => {
    setLoadingDeck(urlhash);
    try {
      const preview = await getDeckPreview(urlhash).unwrap();
      if (preview.url) {
        window.open(preview.url, '_blank');
      }
    } catch {
      window.open(`https://edhrec.com/deckpreview/${urlhash}`, '_blank');
    } finally {
      setLoadingDeck(null);
    }
  };

  const handleCopyDeck = async () => {
    if (avgDeckCards.length === 0) return;
    const deckText = [`1 ${commander.name}`, '', ...avgDeckCards.map((name) => `1 ${name}`)].join('\n');
    try {
      await navigator.clipboard.writeText(deckText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const isLoading = decksLoading || avgDeckLoading;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{commander.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formatNumber(commander.num_decks)} decks on EDHREC
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(`https://edhrec.com${commander.url}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            EDHREC
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Commander Image + Stats */}
          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
            <div>
              <img
                src={commander.image}
                alt={commander.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4">
              {/* Average Deck */}
              {avgDeckLoading ? (
                <Skeleton className="h-24" />
              ) : avgDeckCards.length > 0 ? (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Average Deck ({avgDeckCards.length + 1} cards)</span>
                      <Button size="sm" variant="outline" onClick={handleCopyDeck}>
                        {copied ? (
                          <><Check className="h-4 w-4 text-green-500 mr-1" /> Copied!</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-1" /> Copy Decklist</>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Based on the most popular cards across all {commander.name} decks.
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {/* Stats */}
              {decksData && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">
                          {formatNumber(decksData.table?.length || 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Sample Decks</div>
                      </div>
                    </CardContent>
                  </Card>
                  {decksData.avg_price && (
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-500" />
                        <div>
                          <div className="text-2xl font-bold">
                            {formatPrice(decksData.avg_price)}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Price</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sample Decks */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Decks
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <motion.div
                className="space-y-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {sampleDecks.map((deck) => (
                  <SampleDeckCard
                    key={deck.urlhash}
                    deck={deck}
                    onView={() => handleViewDeck(deck.urlhash)}
                    isLoading={loadingDeck === deck.urlhash}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Main Deck Browser Component
export function DeckBrowser() {
  const [timePeriod, setTimePeriod] = useState<TopCommandersTimePeriod>('month');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCommander, setSelectedCommander] = useState<EDHRECTopCommander | null>(null);

  const { data, isLoading, error } = useGetTopCommandersQuery(timePeriod);
  const commanders = useMemo(() => selectTopCommandersList(data), [data]);

  const filteredCommanders = useMemo(() => {
    if (!searchFilter) return commanders;
    const lower = searchFilter.toLowerCase();
    return commanders.filter((c) => c.name.toLowerCase().includes(lower));
  }, [commanders, searchFilter]);

  const handleSelectCommander = useCallback((commander: EDHRECTopCommander) => {
    setSelectedCommander(commander);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCommander(null);
  }, []);

  // Show commander detail view
  if (selectedCommander) {
    return <CommanderDetail commander={selectedCommander} onBack={handleBack} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-amber-500" />
          <h1 className="text-xl font-bold">Deck Browser</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Time Period Tabs */}
          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TopCommandersTimePeriod)}>
            <TabsList>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter commanders..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">Failed to load commanders. Please try again.</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : filteredCommanders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No commanders found matching "{searchFilter}"</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredCommanders.map((commander, index) => (
                  <CommanderCard
                    key={commander.id}
                    commander={commander}
                    rank={commander.rank || index + 1}
                    onClick={() => handleSelectCommander(commander)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

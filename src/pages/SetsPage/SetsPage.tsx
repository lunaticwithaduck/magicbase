import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetSetsQuery, useGetSetCardsQuery } from '@/api/scryfallApi';
import type { ScryfallSet, ScryfallCard } from '@/types/card';
import { CardGrid } from '@/components/CardGrid/CardGrid';
import { CardDetail } from '@/components/CardDetail/CardDetail';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export function SetsPage() {
  const [selectedSet, setSelectedSet] = useState<ScryfallSet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: setsData, isLoading: setsLoading } = useGetSetsQuery();
  const { data: setCardsData, isLoading: setCardsLoading } = useGetSetCardsQuery(
    { code: selectedSet?.code || '', page },
    { skip: !selectedSet }
  );

  const sets = setsData?.data || [];
  const setCards = setCardsData?.data || [];
  const hasMore = setCardsData?.has_more || false;

  // Filter sets by search
  const filteredSets = sets.filter(
    (set) =>
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sets by year
  const setsByYear = filteredSets.reduce<Record<string, ScryfallSet[]>>((acc, set) => {
    const year = set.released_at?.substring(0, 4) || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(set);
    return acc;
  }, {});

  const sortedYears = Object.keys(setsByYear).sort((a, b) => b.localeCompare(a));

  const handleSetSelect = (set: ScryfallSet) => {
    setSelectedSet(set);
    setPage(1);
  };

  const handleBackToSets = () => {
    setSelectedSet(null);
  };

  const handleCardClick = (card: ScryfallCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  if (selectedSet) {
    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Set Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToSets}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img
              src={selectedSet.icon_svg_uri}
              alt={selectedSet.name}
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-xl font-bold">{selectedSet.name}</h1>
              <p className="text-sm text-muted-foreground">
                {selectedSet.code.toUpperCase()} • {selectedSet.card_count} cards • Released{' '}
                {selectedSet.released_at}
              </p>
            </div>
          </div>
        </div>

        {/* Set Cards */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <CardGrid
              cards={setCards}
              isLoading={setCardsLoading}
              onCardClick={handleCardClick}
            />

            {/* Pagination */}
            {setCards.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Card Detail */}
        <CardDetail
          card={selectedCard}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold mb-4">Card Sets</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sets List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {setsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            sortedYears.map((year) => (
              <div key={year} className="mb-8">
                <h2 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 z-10">
                  {year}
                </h2>
                <div className="grid gap-2">
                  {setsByYear[year].map((set) => (
                    <motion.button
                      key={set.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleSetSelect(set)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card hover:bg-accent transition-colors text-left w-full"
                    >
                      <img
                        src={set.icon_svg_uri}
                        alt={set.name}
                        className="w-6 h-6"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{set.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {set.code.toUpperCase()} • {set.card_count} cards
                        </p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {set.set_type.replace(/_/g, ' ')}
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

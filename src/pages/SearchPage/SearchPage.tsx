import { useState, useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { addCardToDeck } from '@/store/slices/decksSlice';
import { showToast } from '@/store/slices/uiSlice';
import { setQuery } from '@/store/slices/searchSlice';
import { useSearchCardsQuery } from '@/api/scryfallApi';
import type { ScryfallCard } from '@/types/card';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SearchFilters } from '@/components/SearchFilters/SearchFilters';
import { CardGrid } from '@/components/CardGrid/CardGrid';
import { CardDetail } from '@/components/CardDetail/CardDetail';
import { DeckBuilder } from '@/components/DeckBuilder/DeckBuilder';
import { DeckList } from '@/components/DeckList/DeckList';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Filter, Library } from 'lucide-react';

export function SearchPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search.filters);
  const { decks, activeDeckId } = useAppSelector((state) => state.decks);
  const activeDeck = decks.find((d) => d.id === activeDeckId);

  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeckPanelOpen, setIsDeckPanelOpen] = useState(false);

  // Set default search query on mount if no query exists
  useEffect(() => {
    if (!filters.query && !filters.colors?.length && !filters.type && !filters.rarity?.length) {
      // Show some popular/recent cards by default
      dispatch(setQuery('type:creature'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const { data, isLoading, isFetching } = useSearchCardsQuery(
    { filters, page },
    { skip: !filters.query && !filters.colors?.length && !filters.type && !filters.rarity?.length }
  );

  const cards = data?.data || [];
  const hasMore = data?.has_more || false;
  const totalCards = data?.total_cards || 0;

  const handleCardClick = useCallback((card: ScryfallCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  }, []);

  const handleAddToDeck = useCallback(
    (card: ScryfallCard) => {
      if (!activeDeckId) {
        dispatch(showToast({ message: 'Please select a deck first', type: 'error' }));
        return;
      }
      dispatch(addCardToDeck({ deckId: activeDeckId, card }));
      dispatch(showToast({ message: `Added ${card.name} to deck`, type: 'success' }));
    },
    [activeDeckId, dispatch]
  );

  const handleNextPage = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Filters Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-border overflow-hidden">
        <div className="p-4 overflow-y-auto flex-1">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <SearchFilters />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Search Header */}
        <div className="shrink-0 p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <SearchBar className="flex-1" />
            
            {/* Mobile Filter Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <SearchFilters />
              </SheetContent>
            </Sheet>

            {/* Deck Toggle */}
            <Button
              variant="outline"
              onClick={() => setIsDeckPanelOpen(!isDeckPanelOpen)}
              className="hidden md:flex"
            >
              <Library className="h-4 w-4 mr-2" />
              {activeDeck ? activeDeck.name : 'Select Deck'}
            </Button>
          </div>

          {/* Results Count */}
          {totalCards > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              Found {totalCards.toLocaleString()} cards
            </p>
          )}
        </div>

        {/* Cards Grid with Sticky Pagination */}
        <div className="flex-1 flex flex-col min-h-0">
          {!filters.query && !filters.colors?.length && !filters.type && !filters.rarity?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4 overflow-auto">
              <div className="relative">
                <span className="text-7xl mb-4 float">✨</span>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-6xl">🔮</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 mt-8 text-gradient">Search for Magic Cards</h2>
              <p className="text-muted-foreground max-w-md mb-4">
                Explore the multiverse! Use the search bar above to find cards. 
              </p>
              <div className="bg-secondary/50 rounded-lg p-4 max-w-md">
                <p className="text-sm text-muted-foreground mb-2">Try advanced syntax:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <code className="bg-violet-500/20 text-violet-300 px-2 py-1 rounded text-xs">t:creature</code>
                  <code className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">c:blue</code>
                  <code className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">r:mythic</code>
                  <code className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">cmc=3</code>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Scrollable Card Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <CardGrid
                  cards={cards}
                  isLoading={isLoading || isFetching}
                  onCardClick={handleCardClick}
                  onAddToDeck={handleAddToDeck}
                />
              </div>

              {/* Sticky Pagination - Always visible at bottom */}
              {(cards.length > 0 || isLoading) && (
                <div className="shrink-0 flex items-center justify-center gap-4 p-3 border-t border-border bg-background">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasMore}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Deck Panel */}
      {isDeckPanelOpen && (
        <aside className="hidden md:flex w-80 border-l border-border flex-col">
          {activeDeck ? (
            <DeckBuilder deck={activeDeck} onCardClick={handleCardClick} />
          ) : (
            <DeckList onDeckSelect={() => {}} />
          )}
        </aside>
      )}

      {/* Card Detail Modal */}
      <CardDetail
        card={selectedCard}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAddToDeck={handleAddToDeck}
      />
    </div>
  );
}

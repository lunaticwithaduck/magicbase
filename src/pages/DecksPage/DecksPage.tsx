import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setActiveDeck, addCardToDeck } from '@/store/slices/decksSlice';
import { showToast } from '@/store/slices/uiSlice';
import type { ScryfallCard } from '@/types/card';
import { DeckList } from '@/components/DeckList/DeckList';
import { DeckBuilder } from '@/components/DeckBuilder/DeckBuilder';
import { CardDetail } from '@/components/CardDetail/CardDetail';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { CardGrid } from '@/components/CardGrid/CardGrid';
import { useSearchCardsQuery } from '@/api/scryfallApi';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

export function DecksPage() {
  const dispatch = useAppDispatch();
  const { decks, activeDeckId } = useAppSelector((state) => state.decks);
  const activeDeck = decks.find((d) => d.id === activeDeckId);

  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useSearchCardsQuery(
    { filters: { query: searchQuery } },
    { skip: !searchQuery }
  );

  const searchResults = data?.data || [];

  const handleCardClick = useCallback((card: ScryfallCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  }, []);

  const handleAddToDeck = useCallback(
    (card: ScryfallCard) => {
      if (!activeDeckId) return;
      dispatch(addCardToDeck({ deckId: activeDeckId, card }));
      dispatch(showToast({ message: `Added ${card.name} to deck`, type: 'success' }));
    },
    [activeDeckId, dispatch]
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBackToList = () => {
    dispatch(setActiveDeck(null));
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Deck List Sidebar */}
      <aside className="w-72 border-r border-border">
        <DeckList />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeDeck ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" onClick={handleBackToList}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{activeDeck.name}</h1>
                  <p className="text-sm text-muted-foreground capitalize">
                    {activeDeck.format} • {activeDeck.cards.reduce((s, c) => s + c.quantity, 0)} cards
                  </p>
                </div>
              </div>
              <SearchBar
                onSearch={handleSearch}
                placeholder="Search for cards to add..."
                showHints={false}
              />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex min-h-0">
              {/* Search Results */}
              <div className="flex-1 min-w-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {searchQuery ? (
                      <CardGrid
                        cards={searchResults}
                        isLoading={isLoading}
                        onCardClick={handleCardClick}
                        onAddToDeck={handleAddToDeck}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <span className="text-6xl mb-4">🔍</span>
                        <h2 className="text-xl font-semibold mb-2">Search for Cards</h2>
                        <p className="text-muted-foreground">
                          Use the search bar above to find cards to add to your deck
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Deck Builder Panel */}
              <aside className="w-80 border-l border-border">
                <DeckBuilder deck={activeDeck} onCardClick={handleCardClick} />
              </aside>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <span className="text-6xl mb-4">📚</span>
            <h2 className="text-2xl font-bold mb-2">Select a Deck</h2>
            <p className="text-muted-foreground max-w-md">
              Choose a deck from the sidebar to start editing, or create a new deck to get started.
            </p>
          </div>
        )}
      </main>

      {/* Card Detail Modal */}
      <CardDetail
        card={selectedCard}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onAddToDeck={activeDeck ? handleAddToDeck : undefined}
      />
    </div>
  );
}

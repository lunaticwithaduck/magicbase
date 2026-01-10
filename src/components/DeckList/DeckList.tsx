import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Copy, MoreVertical } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  createDeck,
  deleteDeck,
  setActiveDeck,
  duplicateDeck,
} from '@/store/slices/decksSlice';
import type { DeckFormat } from '@/types/deck';
import { FORMAT_LABELS } from '@/types/deck';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DeckListProps {
  onDeckSelect?: (deckId: string) => void;
}

const colorSymbols: Record<string, string> = {
  W: '☀️',
  U: '💧',
  B: '💀',
  R: '🔥',
  G: '🌲',
};

export function DeckList({ onDeckSelect }: DeckListProps) {
  const dispatch = useAppDispatch();
  const { decks, activeDeckId } = useAppSelector((state) => state.decks);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<DeckFormat>('commander');

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      dispatch(createDeck({ name: newDeckName.trim(), format: newDeckFormat }));
      setNewDeckName('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleSelectDeck = (deckId: string) => {
    dispatch(setActiveDeck(deckId));
    onDeckSelect?.(deckId);
  };

  const handleDeleteDeck = (deckId: string) => {
    dispatch(deleteDeck(deckId));
  };

  const handleDuplicateDeck = (deckId: string) => {
    dispatch(duplicateDeck(deckId));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Decks</h2>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          New Deck
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            <AnimatePresence>
              {decks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No decks yet</p>
                  <p className="text-sm">Create your first deck to get started</p>
                </div>
              ) : (
                decks.map((deck) => {
                  const cardCount = deck.cards.reduce((sum, c) => sum + c.quantity, 0);
                  const isActive = deck.id === activeDeckId;

                return (
                  <motion.div
                    key={deck.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'p-3 rounded-lg mb-2 cursor-pointer transition-colors border',
                      isActive
                        ? 'bg-accent border-primary'
                        : 'bg-card hover:bg-accent/50 border-transparent'
                    )}
                    onClick={() => handleSelectDeck(deck.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{deck.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {FORMAT_LABELS[deck.format]}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {cardCount} cards
                          </span>
                        </div>
                        {deck.colorIdentity.length > 0 && (
                          <div className="flex gap-0.5 mt-1">
                            {deck.colorIdentity.map((color) => (
                              <span key={color} className="text-sm">
                                {colorSymbols[color] || color}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicateDeck(deck.id)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteDeck(deck.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                );
              })
            )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Create Deck Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Deck Name</label>
              <Input
                placeholder="My Awesome Deck"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select value={newDeckFormat} onValueChange={(v) => setNewDeckFormat(v as DeckFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMAT_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDeck} disabled={!newDeckName.trim()}>
              Create Deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

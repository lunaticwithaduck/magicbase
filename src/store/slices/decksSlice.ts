import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Deck, DeckCard, DeckFormat } from '@/types/deck';
import type { ScryfallCard } from '@/types/card';
import { v4 as uuidv4 } from 'uuid';

interface DecksState {
  decks: Deck[];
  activeDeckId: string | null;
}

const loadDecksFromStorage = (): Deck[] => {
  try {
    const stored = localStorage.getItem('mtg-decks');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDecksToStorage = (decks: Deck[]) => {
  try {
    localStorage.setItem('mtg-decks', JSON.stringify(decks));
  } catch (e) {
    console.error('Failed to save decks to storage:', e);
  }
};

const calculateColorIdentity = (cards: DeckCard[]): string[] => {
  const colors = new Set<string>();
  cards.forEach(({ card }) => {
    card.color_identity.forEach((c) => colors.add(c));
  });
  return Array.from(colors).sort();
};

const initialState: DecksState = {
  decks: loadDecksFromStorage(),
  activeDeckId: null,
};

const decksSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    createDeck: (
      state,
      action: PayloadAction<{ name: string; format: DeckFormat; description?: string }>
    ) => {
      const newDeck: Deck = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        format: action.payload.format,
        cards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        colorIdentity: [],
      };
      state.decks.push(newDeck);
      state.activeDeckId = newDeck.id;
      saveDecksToStorage(state.decks);
    },

    deleteDeck: (state, action: PayloadAction<string>) => {
      state.decks = state.decks.filter((deck) => deck.id !== action.payload);
      if (state.activeDeckId === action.payload) {
        state.activeDeckId = state.decks.length > 0 ? state.decks[0].id : null;
      }
      saveDecksToStorage(state.decks);
    },

    setActiveDeck: (state, action: PayloadAction<string | null>) => {
      state.activeDeckId = action.payload;
    },

    updateDeck: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Omit<Deck, 'id' | 'cards'>> }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.id);
      if (deck) {
        Object.assign(deck, action.payload.updates);
        deck.updatedAt = new Date().toISOString();
        saveDecksToStorage(state.decks);
      }
    },

    addCardToDeck: (
      state,
      action: PayloadAction<{
        deckId: string;
        card: ScryfallCard;
        quantity?: number;
        isSideboard?: boolean;
        isCommander?: boolean;
      }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const existingCard = deck.cards.find(
          (c) =>
            c.card.id === action.payload.card.id &&
            c.isSideboard === (action.payload.isSideboard || false)
        );

        if (existingCard) {
          existingCard.quantity += action.payload.quantity || 1;
        } else {
          deck.cards.push({
            card: action.payload.card,
            quantity: action.payload.quantity || 1,
            isSideboard: action.payload.isSideboard || false,
            isCommander: action.payload.isCommander || false,
          });
        }

        deck.colorIdentity = calculateColorIdentity(deck.cards);
        deck.updatedAt = new Date().toISOString();

        if (!deck.coverCard) {
          deck.coverCard = action.payload.card;
        }

        saveDecksToStorage(state.decks);
      }
    },

    removeCardFromDeck: (
      state,
      action: PayloadAction<{
        deckId: string;
        cardId: string;
        isSideboard: boolean;
        removeAll?: boolean;
      }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const cardIndex = deck.cards.findIndex(
          (c) =>
            c.card.id === action.payload.cardId &&
            c.isSideboard === action.payload.isSideboard
        );

        if (cardIndex !== -1) {
          if (action.payload.removeAll || deck.cards[cardIndex].quantity <= 1) {
            deck.cards.splice(cardIndex, 1);
          } else {
            deck.cards[cardIndex].quantity -= 1;
          }
        }

        deck.colorIdentity = calculateColorIdentity(deck.cards);
        deck.updatedAt = new Date().toISOString();
        saveDecksToStorage(state.decks);
      }
    },

    updateCardQuantity: (
      state,
      action: PayloadAction<{
        deckId: string;
        cardId: string;
        isSideboard: boolean;
        quantity: number;
      }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const card = deck.cards.find(
          (c) =>
            c.card.id === action.payload.cardId &&
            c.isSideboard === action.payload.isSideboard
        );

        if (card) {
          if (action.payload.quantity <= 0) {
            deck.cards = deck.cards.filter(
              (c) =>
                !(
                  c.card.id === action.payload.cardId &&
                  c.isSideboard === action.payload.isSideboard
                )
            );
          } else {
            card.quantity = action.payload.quantity;
          }
          deck.updatedAt = new Date().toISOString();
          saveDecksToStorage(state.decks);
        }
      }
    },

    moveCardToSideboard: (
      state,
      action: PayloadAction<{ deckId: string; cardId: string }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const mainCard = deck.cards.find(
          (c) => c.card.id === action.payload.cardId && !c.isSideboard
        );
        if (mainCard) {
          const sideboardCard = deck.cards.find(
            (c) => c.card.id === action.payload.cardId && c.isSideboard
          );
          if (sideboardCard) {
            sideboardCard.quantity += mainCard.quantity;
            deck.cards = deck.cards.filter(
              (c) => !(c.card.id === action.payload.cardId && !c.isSideboard)
            );
          } else {
            mainCard.isSideboard = true;
          }
          deck.updatedAt = new Date().toISOString();
          saveDecksToStorage(state.decks);
        }
      }
    },

    moveCardToMainboard: (
      state,
      action: PayloadAction<{ deckId: string; cardId: string }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const sideCard = deck.cards.find(
          (c) => c.card.id === action.payload.cardId && c.isSideboard
        );
        if (sideCard) {
          const mainCard = deck.cards.find(
            (c) => c.card.id === action.payload.cardId && !c.isSideboard
          );
          if (mainCard) {
            mainCard.quantity += sideCard.quantity;
            deck.cards = deck.cards.filter(
              (c) => !(c.card.id === action.payload.cardId && c.isSideboard)
            );
          } else {
            sideCard.isSideboard = false;
          }
          deck.updatedAt = new Date().toISOString();
          saveDecksToStorage(state.decks);
        }
      }
    },

    setCoverCard: (
      state,
      action: PayloadAction<{ deckId: string; card: ScryfallCard }>
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.coverCard = action.payload.card;
        deck.updatedAt = new Date().toISOString();
        saveDecksToStorage(state.decks);
      }
    },

    importDeck: (state, action: PayloadAction<Deck>) => {
      const newDeck = {
        ...action.payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.decks.push(newDeck);
      state.activeDeckId = newDeck.id;
      saveDecksToStorage(state.decks);
    },

    duplicateDeck: (state, action: PayloadAction<string>) => {
      const originalDeck = state.decks.find((d) => d.id === action.payload);
      if (originalDeck) {
        const newDeck: Deck = {
          ...originalDeck,
          id: uuidv4(),
          name: `${originalDeck.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.decks.push(newDeck);
        state.activeDeckId = newDeck.id;
        saveDecksToStorage(state.decks);
      }
    },
  },
});

export const {
  createDeck,
  deleteDeck,
  setActiveDeck,
  updateDeck,
  addCardToDeck,
  removeCardFromDeck,
  updateCardQuantity,
  moveCardToSideboard,
  moveCardToMainboard,
  setCoverCard,
  importDeck,
  duplicateDeck,
} = decksSlice.actions;

export default decksSlice.reducer;

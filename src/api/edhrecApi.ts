import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// EDHREC API types
export interface EDHRECSynergyCard {
  id: string;
  name: string;
  sanitized: string;
  url: string;
  synergy?: number;
  inclusion?: number;
  num_decks?: number;
  potential_decks?: number;
  // We'll add this ourselves
  image?: string;
}

export interface EDHRECCardList {
  tag: string;
  cardviews: EDHRECSynergyCard[];
}

export interface EDHRECCardData {
  container?: {
    json_dict?: {
      cardlists?: EDHRECCardList[];
      card?: {
        name: string;
        sanitized: string;
      };
    };
  };
  similar?: EDHRECSynergyCard[];
}

// Commander deck types
export interface EDHRECDeckTheme {
  href: string;
  value: string;
  alt?: string | null;
  current?: boolean;
}

export interface EDHRECDeckLink {
  header: string;
  items: EDHRECDeckTheme[];
  separator?: boolean;
}

export interface EDHRECCommanderData {
  num_decks?: number;
  panels?: {
    links?: EDHRECDeckLink[];
  };
  container?: {
    json_dict?: {
      cardlists?: EDHRECCardList[];
      card?: {
        name: string;
        sanitized: string;
        color_identity?: string[];
      };
    };
  };
}

export interface EDHRECSampleDeck {
  urlhash: string;
  savedate: string;
  price: number;
  salt: number;
  tags: string[];
  creature: number;
  instant: number;
  sorcery: number;
  artifact: number;
  enchantment: number;
  battle: number;
  planeswalker: number;
  land: number;
}

export interface EDHRECDecksData {
  num_decks_avg?: number;
  table?: EDHRECSampleDeck[];
  avg_price?: number;
}

export interface EDHRECAverageDeckCard {
  name: string;
  image?: string;
}

export interface EDHRECAverageDeckData {
  container?: {
    json_dict?: {
      cardlists?: {
        tag: string;
        cardviews: EDHRECAverageDeckCard[];
      }[];
    };
  };
}

export interface EDHRECDeckPreview {
  urlhash: string;
  url: string;
  price: number;
  salt: number;
  savedate: string;
  commanders: (string | null)[];
  coloridentity: string[];
  creature: number;
  instant: number;
  sorcery: number;
  artifact: number;
  enchantment: number;
  battle: number;
  planeswalker: number;
  land: number;
  tags: string[];
  edhrec_tags: string[];
  cedh: boolean;
}

// Top commanders types
export interface EDHRECTopCommander {
  id: string;
  name: string;
  sanitized: string;
  url: string;
  inclusion?: number;
  num_decks: number;
  rank?: number;
  label?: string;
  image?: string;
}

export interface EDHRECTopCommandersData {
  container?: {
    json_dict?: {
      cardlists?: {
        tag: string;
        cardviews: EDHRECTopCommander[];
      }[];
    };
  };
}

export type TopCommandersTimePeriod = 'week' | 'month' | 'year';

// Helper to sanitize card name for EDHREC URL
const sanitizeCardName = (name: string): string => {
  // Handle double-faced cards - take first face only
  const firstName = name.split('//')[0].trim();
  
  return firstName
    .toLowerCase()
    .replace(/[',.:]/g, '') // Remove apostrophes, commas, periods, colons
    .replace(/[^a-z0-9\s-]/g, '') // Remove other special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Helper to get Scryfall image from card name
const getScryfallImageUrl = (cardName: string): string => {
  const encodedName = encodeURIComponent(cardName);
  return `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=normal`;
};

// EDHREC API for card synergies
export const edhrecApi = createApi({
  reducerPath: 'edhrecApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://json.edhrec.com',
    mode: 'cors',
  }),
  endpoints: (builder) => ({
    // Get synergy data for a card
    getCardSynergies: builder.query<EDHRECCardData, string>({
      query: (cardName) => {
        const sanitized = sanitizeCardName(cardName);
        return `/pages/cards/${sanitized}.json`;
      },
      // Transform to add Scryfall images
      transformResponse: (response: EDHRECCardData) => {
        // Add Scryfall images to cards in cardlists
        if (response.container?.json_dict?.cardlists) {
          response.container.json_dict.cardlists = response.container.json_dict.cardlists.map((list) => ({
            ...list,
            cardviews: list.cardviews.map((card) => ({
              ...card,
              image: getScryfallImageUrl(card.name),
            })),
          }));
        }
        
        // Also add images to similar cards
        if (response.similar) {
          response.similar = response.similar.map((card) => ({
            ...card,
            image: getScryfallImageUrl(card.name),
          }));
        }
        
        return response;
      },
    }),
    
    // Get commander page data (themes, deck count, etc.)
    getCommanderData: builder.query<EDHRECCommanderData, string>({
      query: (cardName) => {
        const sanitized = sanitizeCardName(cardName);
        return `/pages/commanders/${sanitized}.json`;
      },
      transformResponse: (response: EDHRECCommanderData) => {
        // Add Scryfall images to cards in cardlists
        if (response.container?.json_dict?.cardlists) {
          response.container.json_dict.cardlists = response.container.json_dict.cardlists.map((list) => ({
            ...list,
            cardviews: list.cardviews.map((card) => ({
              ...card,
              image: getScryfallImageUrl(card.name),
            })),
          }));
        }
        return response;
      },
    }),
    
    // Get sample decks for a commander
    getCommanderDecks: builder.query<EDHRECDecksData, string>({
      query: (cardName) => {
        const sanitized = sanitizeCardName(cardName);
        return `/pages/decks/${sanitized}.json`;
      },
    }),
    
    // Get average deck composition for a commander
    getAverageDeck: builder.query<EDHRECAverageDeckData, string>({
      query: (cardName) => {
        const sanitized = sanitizeCardName(cardName);
        return `/pages/average-decks/${sanitized}.json`;
      },
      transformResponse: (response: EDHRECAverageDeckData) => {
        // Add Scryfall images to cards
        if (response.container?.json_dict?.cardlists) {
          response.container.json_dict.cardlists = response.container.json_dict.cardlists.map((list) => ({
            ...list,
            cardviews: list.cardviews.map((card) => ({
              ...card,
              image: getScryfallImageUrl(card.name),
            })),
          }));
        }
        return response;
      },
    }),
    
    // Get top commanders by time period
    getTopCommanders: builder.query<EDHRECTopCommandersData, TopCommandersTimePeriod>({
      query: (period) => `/pages/commanders/${period}.json`,
      transformResponse: (response: EDHRECTopCommandersData) => {
        // Add Scryfall images to commanders
        if (response.container?.json_dict?.cardlists) {
          response.container.json_dict.cardlists = response.container.json_dict.cardlists.map((list) => ({
            ...list,
            cardviews: list.cardviews.map((card) => ({
              ...card,
              image: getScryfallImageUrl(card.name),
            })),
          }));
        }
        return response;
      },
    }),
  }),
});

// EDHREC API for deck previews (different base URL)
export const edhrecDeckApi = createApi({
  reducerPath: 'edhrecDeckApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://edhrec.com/api',
    mode: 'cors',
  }),
  endpoints: (builder) => ({
    // Get deck preview with external link
    getDeckPreview: builder.query<EDHRECDeckPreview, string>({
      query: (urlhash) => `/deckpreview/${urlhash}`,
    }),
  }),
});

export const {
  useGetCardSynergiesQuery,
  useLazyGetCardSynergiesQuery,
  useGetCommanderDataQuery,
  useLazyGetCommanderDataQuery,
  useGetCommanderDecksQuery,
  useLazyGetCommanderDecksQuery,
  useGetAverageDeckQuery,
  useLazyGetAverageDeckQuery,
  useGetTopCommandersQuery,
} = edhrecApi;

export const {
  useGetDeckPreviewQuery,
  useLazyGetDeckPreviewQuery,
} = edhrecDeckApi;

// Selector helpers - now using correct path
export const selectHighSynergyCards = (data?: EDHRECCardData, limit = 12): EDHRECSynergyCard[] => {
  const cardlists = data?.container?.json_dict?.cardlists;
  if (!cardlists) return [];
  
  // Collect all synergy cards from multiple sources
  const allCards: EDHRECSynergyCard[] = [];
  
  // Priority order: highsynergycards > topcards > gamechangers > similar
  const highSynergyList = cardlists.find((list) => list.tag === 'highsynergycards');
  if (highSynergyList && highSynergyList.cardviews.length > 0) {
    allCards.push(...highSynergyList.cardviews);
  }
  
  const topCardsList = cardlists.find((list) => list.tag === 'topcards');
  if (topCardsList && topCardsList.cardviews.length > 0) {
    // Add cards not already in allCards
    topCardsList.cardviews.forEach(card => {
      if (!allCards.some(c => c.name === card.name)) {
        allCards.push(card);
      }
    });
  }
  
  const gameChangersList = cardlists.find((list) => list.tag === 'gamechangers');
  if (gameChangersList && gameChangersList.cardviews.length > 0) {
    gameChangersList.cardviews.forEach(card => {
      if (!allCards.some(c => c.name === card.name)) {
        allCards.push(card);
      }
    });
  }
  
  // Fallback: try similar cards from top level
  if (data?.similar && data.similar.length > 0) {
    data.similar.forEach(card => {
      if (!allCards.some(c => c.name === card.name)) {
        allCards.push({
          ...card,
          image: getScryfallImageUrl(card.name),
        });
      }
    });
  }
  
  // Last fallback: get cards from any available list (except commanders)
  if (allCards.length === 0) {
    for (const list of cardlists) {
      if (list.cardviews.length > 0 && !list.tag.includes('commander')) {
        allCards.push(...list.cardviews);
        break;
      }
    }
  }
  
  // Sort by synergy score (higher is better) and apply limit
  return [...allCards]
    .sort((a, b) => (b.synergy ?? 0) - (a.synergy ?? 0))
    .slice(0, limit);
};

export const selectTopCommanders = (data?: EDHRECCardData): EDHRECSynergyCard[] => {
  const cardlists = data?.container?.json_dict?.cardlists;
  if (!cardlists) return [];
  
  const commandersList = cardlists.find((list) => list.tag === 'topcommanders');
  return commandersList?.cardviews.slice(0, 8) || [];
};

// Commander deck helpers
export interface DeckTheme {
  name: string;
  slug: string;
  commanderSlug: string;
}

export const selectDeckThemes = (data?: EDHRECCommanderData): DeckTheme[] => {
  const links = data?.panels?.links;
  if (!links) return [];
  
  const themes: DeckTheme[] = [];
  
  for (const link of links) {
    for (const item of link.items) {
      // Only include tag-based themes (not "As commander", "As card", etc.)
      if (item.href?.includes('/tags/')) {
        // Extract slug from href like "/tags/infect/atraxa-praetors-voice"
        const parts = item.href.split('/');
        const tagIndex = parts.indexOf('tags');
        if (tagIndex !== -1 && parts[tagIndex + 1] && parts[tagIndex + 2]) {
          themes.push({
            name: item.value,
            slug: parts[tagIndex + 1],
            commanderSlug: parts[tagIndex + 2],
          });
        }
      }
    }
  }
  
  return themes;
};

export const selectSampleDecks = (data?: EDHRECDecksData, limit = 10): EDHRECSampleDeck[] => {
  if (!data?.table) return [];
  
  // Sort by most recent and take the specified limit
  return [...data.table]
    .sort((a, b) => new Date(b.savedate).getTime() - new Date(a.savedate).getTime())
    .slice(0, limit);
};

export const selectAverageDeckCards = (data?: EDHRECAverageDeckData): { category: string; cards: EDHRECAverageDeckCard[] }[] => {
  const cardlists = data?.container?.json_dict?.cardlists;
  if (!cardlists) return [];
  
  return cardlists.map((list) => ({
    category: list.tag,
    cards: list.cardviews,
  }));
};

export const selectAllAverageDeckCardNames = (data?: EDHRECAverageDeckData): string[] => {
  const cardlists = data?.container?.json_dict?.cardlists;
  if (!cardlists) return [];
  
  return cardlists.flatMap((list) => list.cardviews.map((card) => card.name));
};

// Top commanders helper
export const selectTopCommandersList = (data?: EDHRECTopCommandersData): EDHRECTopCommander[] => {
  const cardlists = data?.container?.json_dict?.cardlists;
  if (!cardlists || cardlists.length === 0) return [];
  
  return cardlists[0].cardviews;
};

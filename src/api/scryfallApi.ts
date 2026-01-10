import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  ScryfallCard,
  ScryfallList,
  ScryfallSet,
  ScryfallRuling,
  ScryfallSymbol,
  AutocompleteResult,
} from '@/types/card';
import type { SearchFilters } from '@/types/search';

const SCRYFALL_BASE_URL = 'https://api.scryfall.com';

// Rate limiting helper - Scryfall asks for 50-100ms between requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildSearchQuery = (filters: SearchFilters): string => {
  const parts: string[] = [];

  if (filters.query) {
    parts.push(filters.query);
  }

  if (filters.colors && filters.colors.length > 0) {
    const colorStr = filters.colors.join('');
    switch (filters.colorMatch) {
      case 'exact':
        parts.push(`c=${colorStr}`);
        break;
      case 'atMost':
        parts.push(`c<=${colorStr}`);
        break;
      default:
        parts.push(`c:${colorStr}`);
    }
  }

  if (filters.type) {
    parts.push(`t:${filters.type}`);
  }

  if (filters.rarity && filters.rarity.length > 0) {
    const rarityParts = filters.rarity.map((r) => `r:${r}`).join(' or ');
    parts.push(`(${rarityParts})`);
  }

  if (filters.set) {
    parts.push(`s:${filters.set}`);
  }

  if (filters.cmc) {
    if (filters.cmc.min !== undefined) {
      parts.push(`cmc>=${filters.cmc.min}`);
    }
    if (filters.cmc.max !== undefined) {
      parts.push(`cmc<=${filters.cmc.max}`);
    }
  }

  if (filters.power) {
    if (filters.power.min !== undefined) {
      parts.push(`pow>=${filters.power.min}`);
    }
    if (filters.power.max !== undefined) {
      parts.push(`pow<=${filters.power.max}`);
    }
  }

  if (filters.toughness) {
    if (filters.toughness.min !== undefined) {
      parts.push(`tou>=${filters.toughness.min}`);
    }
    if (filters.toughness.max !== undefined) {
      parts.push(`tou<=${filters.toughness.max}`);
    }
  }

  if (filters.format && filters.isLegal) {
    parts.push(`f:${filters.format}`);
  }

  return parts.join(' ');
};

export const scryfallApi = createApi({
  reducerPath: 'scryfallApi',
  baseQuery: fetchBaseQuery({
    baseUrl: SCRYFALL_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Search cards with filters
    searchCards: builder.query<
      ScryfallList<ScryfallCard>,
      { filters: SearchFilters; page?: number }
    >({
      query: ({ filters, page = 1 }) => {
        const q = buildSearchQuery(filters);
        const params = new URLSearchParams({
          q: q || '*',
          page: String(page),
          include_extras: 'false',
          include_variations: 'false',
        });

        if (filters.sortBy) {
          params.set('order', filters.sortBy);
          if (filters.sortDirection) {
            params.set('dir', filters.sortDirection);
          }
        }

        return `/cards/search?${params.toString()}`;
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await queryFulfilled;
        await delay(100); // Rate limiting
      },
    }),

    // Get card by ID
    getCardById: builder.query<ScryfallCard, string>({
      query: (id) => `/cards/${id}`,
    }),

    // Get card by name (exact)
    getCardByName: builder.query<ScryfallCard, { name: string; exact?: boolean }>({
      query: ({ name, exact = true }) => {
        const params = new URLSearchParams({
          [exact ? 'exact' : 'fuzzy']: name,
        });
        return `/cards/named?${params.toString()}`;
      },
    }),

    // Get random card
    getRandomCard: builder.query<ScryfallCard, string | void>({
      query: (query) => {
        if (query) {
          return `/cards/random?q=${encodeURIComponent(query)}`;
        }
        return '/cards/random';
      },
    }),

    // Autocomplete card names
    autocompleteCards: builder.query<AutocompleteResult, string>({
      query: (query) => `/cards/autocomplete?q=${encodeURIComponent(query)}`,
    }),

    // Get all sets
    getSets: builder.query<ScryfallList<ScryfallSet>, void>({
      query: () => '/sets',
    }),

    // Get set by code
    getSetByCode: builder.query<ScryfallSet, string>({
      query: (code) => `/sets/${code}`,
    }),

    // Get cards in a set
    getSetCards: builder.query<ScryfallList<ScryfallCard>, { code: string; page?: number }>({
      query: ({ code, page = 1 }) =>
        `/cards/search?q=set:${code}&order=set&page=${page}`,
    }),

    // Get card rulings
    getCardRulings: builder.query<ScryfallList<ScryfallRuling>, string>({
      query: (id) => `/cards/${id}/rulings`,
    }),

    // Get all card symbols
    getSymbols: builder.query<ScryfallList<ScryfallSymbol>, void>({
      query: () => '/symbology',
    }),

    // Parse mana cost
    parseMana: builder.query<{ cost: string; cmc: number; colors: string[] }, string>({
      query: (cost) => `/symbology/parse-mana?cost=${encodeURIComponent(cost)}`,
    }),
  }),
});

export const {
  useSearchCardsQuery,
  useLazySearchCardsQuery,
  useGetCardByIdQuery,
  useLazyGetCardByIdQuery,
  useGetCardByNameQuery,
  useLazyGetCardByNameQuery,
  useGetRandomCardQuery,
  useLazyGetRandomCardQuery,
  useAutocompleteCardsQuery,
  useLazyAutocompleteCardsQuery,
  useGetSetsQuery,
  useGetSetByCodeQuery,
  useGetSetCardsQuery,
  useGetCardRulingsQuery,
  useGetSymbolsQuery,
  useParseManaQuery,
} = scryfallApi;

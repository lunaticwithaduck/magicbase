export interface CardFace {
  object: string;
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  flavor_text?: string;
  artist?: string;
  artist_id?: string;
  illustration_id?: string;
  image_uris?: ImageUris;
}

export interface ImageUris {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
}

export interface Legalities {
  standard: string;
  future: string;
  historic: string;
  timeless: string;
  gladiator: string;
  pioneer: string;
  explorer: string;
  modern: string;
  legacy: string;
  pauper: string;
  vintage: string;
  penny: string;
  commander: string;
  oathbreaker: string;
  standardbrawl: string;
  brawl: string;
  alchemy: string;
  paupercommander: string;
  duel: string;
  oldschool: string;
  premodern: string;
  predh: string;
}

export interface Prices {
  usd: string | null;
  usd_foil: string | null;
  usd_etched: string | null;
  eur: string | null;
  eur_foil: string | null;
  tix: string | null;
}

export interface RelatedUris {
  gatherer?: string;
  tcgplayer_infinite_articles?: string;
  tcgplayer_infinite_decks?: string;
  edhrec?: string;
}

export interface PurchaseUris {
  tcgplayer?: string;
  cardmarket?: string;
  cardhoarder?: string;
}

export interface ScryfallCard {
  object: 'card';
  id: string;
  oracle_id: string;
  multiverse_ids?: number[];
  mtgo_id?: number;
  mtgo_foil_id?: number;
  tcgplayer_id?: number;
  cardmarket_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris?: ImageUris;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  legalities: Legalities;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus';
  flavor_text?: string;
  card_back_id?: string;
  artist?: string;
  artist_ids?: string[];
  illustration_id?: string;
  border_color: string;
  frame: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank?: number;
  penny_rank?: number;
  prices: Prices;
  related_uris: RelatedUris;
  purchase_uris?: PurchaseUris;
  card_faces?: CardFace[];
  all_parts?: RelatedCard[];
}

export interface RelatedCard {
  object: 'related_card';
  id: string;
  component: string;
  name: string;
  type_line: string;
  uri: string;
}

export interface ScryfallList<T> {
  object: 'list';
  total_cards: number;
  has_more: boolean;
  next_page?: string;
  data: T[];
}

export interface ScryfallSet {
  object: 'set';
  id: string;
  code: string;
  name: string;
  uri: string;
  scryfall_uri: string;
  search_uri: string;
  released_at: string;
  set_type: string;
  card_count: number;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  icon_svg_uri: string;
}

export interface ScryfallRuling {
  object: 'ruling';
  oracle_id: string;
  source: string;
  published_at: string;
  comment: string;
}

export interface ScryfallSymbol {
  object: 'card_symbol';
  symbol: string;
  loose_variant: string | null;
  english: string;
  transposable: boolean;
  represents_mana: boolean;
  appears_in_mana_costs: boolean;
  mana_value: number | null;
  hybrid: boolean;
  phyrexian: boolean;
  cmc: number | null;
  funny: boolean;
  colors: string[];
  gatherer_alternates: string[] | null;
  svg_uri: string;
}

export interface AutocompleteResult {
  object: 'catalog';
  total_values: number;
  data: string[];
}

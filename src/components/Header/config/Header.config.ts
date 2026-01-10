import { Search, Library, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Navigation item configuration
 */
export interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Search', icon: Search },
  { path: '/decks', label: 'Decks', icon: Library },
  { path: '/sets', label: 'Sets', icon: Layers },
];

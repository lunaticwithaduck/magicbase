import { useMemo } from 'react';
import type { DeckCard, DeckStats } from '@/types/deck';

export function useDeckStats(cards: DeckCard[]): DeckStats {
  return useMemo(() => {
    const mainboard = cards.filter((c) => !c.isSideboard);
    const sideboard = cards.filter((c) => c.isSideboard);

    const mainboardCount = mainboard.reduce((sum, c) => sum + c.quantity, 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);
    const totalCards = mainboardCount + sideboardCount;

    // Average CMC (excluding lands)
    const nonLandCards = mainboard.filter(
      (c) => !c.card.type_line.toLowerCase().includes('land')
    );
    const totalCmc = nonLandCards.reduce(
      (sum, c) => sum + c.card.cmc * c.quantity,
      0
    );
    const totalNonLandCount = nonLandCards.reduce((sum, c) => sum + c.quantity, 0);
    const averageCmc = totalNonLandCount > 0 ? totalCmc / totalNonLandCount : 0;

    // Color distribution
    const colorDistribution: Record<string, number> = {
      W: 0,
      U: 0,
      B: 0,
      R: 0,
      G: 0,
      C: 0,
    };
    mainboard.forEach(({ card, quantity }) => {
      if (card.colors && card.colors.length > 0) {
        card.colors.forEach((color) => {
          colorDistribution[color] = (colorDistribution[color] || 0) + quantity;
        });
      } else {
        colorDistribution['C'] += quantity;
      }
    });

    // Type distribution
    const typeDistribution: Record<string, number> = {};
    const typeOrder = [
      'Creature',
      'Instant',
      'Sorcery',
      'Enchantment',
      'Artifact',
      'Planeswalker',
      'Land',
      'Battle',
    ];
    
    mainboard.forEach(({ card, quantity }) => {
      const typeLine = card.type_line.toLowerCase();
      for (const type of typeOrder) {
        if (typeLine.includes(type.toLowerCase())) {
          typeDistribution[type] = (typeDistribution[type] || 0) + quantity;
          break;
        }
      }
    });

    // Rarity distribution
    const rarityDistribution: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythic: 0,
    };
    mainboard.forEach(({ card, quantity }) => {
      const rarity = card.rarity;
      if (rarity in rarityDistribution) {
        rarityDistribution[rarity] += quantity;
      }
    });

    // Mana curve
    const manaCurve: Record<number, number> = {};
    nonLandCards.forEach(({ card, quantity }) => {
      const cmc = Math.min(Math.floor(card.cmc), 7); // 7+ grouped together
      manaCurve[cmc] = (manaCurve[cmc] || 0) + quantity;
    });

    return {
      totalCards,
      mainboardCount,
      sideboardCount,
      averageCmc: Math.round(averageCmc * 100) / 100,
      colorDistribution,
      typeDistribution,
      rarityDistribution,
      manaCurve,
    };
  }, [cards]);
}

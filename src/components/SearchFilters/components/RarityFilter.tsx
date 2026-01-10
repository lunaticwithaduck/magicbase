import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { RARITY_OPTIONS } from '@/types/search';
import { styles, rarityColorClasses } from '../SearchFilters.styles';

interface RarityFilterProps {
  selectedRarities: string[];
  onToggle: (rarity: string) => void;
}

export function RarityFilter({ selectedRarities, onToggle }: RarityFilterProps) {
  return (
    <div>
      <h3 className={styles.sectionHeader}>Rarity</h3>
      <div className={styles.rarityBadgesGrid}>
        {RARITY_OPTIONS.map(({ value, label }) => {
          const isSelected = selectedRarities.includes(value);
          return (
            <Badge
              key={value}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                styles.rarityBadge,
                rarityColorClasses[value],
                isSelected && styles.rarityBadgeSelected
              )}
              onClick={() => onToggle(value)}
            >
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

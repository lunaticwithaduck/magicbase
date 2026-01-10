import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QUICK_FILTERS, type QuickFilter } from '../config/SearchFilters.config';
import { styles } from '../SearchFilters.styles';
import type { SearchFilters } from '@/types/search';

interface QuickFiltersProps {
  onApply: (filters: Partial<SearchFilters>) => void;
}

export function QuickFilters({ onApply }: QuickFiltersProps) {
  return (
    <div>
      <h3 className={styles.sectionHeader}>Quick Filters</h3>
      <div className={styles.quickFiltersGrid}>
        {QUICK_FILTERS.map((filter: QuickFilter) => (
          <Badge
            key={filter.id}
            variant="outline"
            className={cn(styles.quickFilterBadge, filter.hoverClass)}
            onClick={() => onApply(filter.filters)}
          >
            {filter.icon} {filter.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}

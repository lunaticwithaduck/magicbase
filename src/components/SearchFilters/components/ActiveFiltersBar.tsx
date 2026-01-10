import { Button } from '@/components/ui/button';
import { styles } from '../SearchFilters.styles';

interface ActiveFiltersBarProps {
  count: number;
  onClear: () => void;
}

export function ActiveFiltersBar({ count, onClear }: ActiveFiltersBarProps) {
  if (count === 0) return null;

  return (
    <div className={styles.activeFiltersBanner}>
      <div className={styles.activeFiltersContent}>
        <div className="flex items-center gap-2">
          <span className={styles.activeFiltersText}>
            {count} {count === 1 ? 'Filter' : 'Filters'} Active
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className={styles.clearAllButton}
        >
          Clear All
        </Button>
      </div>
    </div>
  );
}

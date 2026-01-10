import { useState } from 'react';
import { History, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { styles } from '../SearchFilters.styles';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onClear: () => void;
}

export function RecentSearches({ searches, onSelect, onClear }: RecentSearchesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (searches.length === 0) return null;

  return (
    <div className={styles.recentSearchesContainer}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.recentSearchesButton}
      >
        <div className={styles.recentSearchesLabel}>
          <History className={styles.iconSmall} />
          Recent Searches
        </div>
        {isExpanded ? (
          <ChevronUp className={styles.iconSmall} />
        ) : (
          <ChevronDown className={styles.iconSmall} />
        )}
      </button>

      {isExpanded && (
        <div className={styles.recentSearchesList}>
          {searches.map((search, index) => (
            <div
              key={index}
              className={styles.recentSearchItem}
              onClick={() => onSelect(search)}
            >
              <span className="truncate flex-1">{search}</span>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className={styles.clearHistoryButton}
          >
            Clear History
          </Button>
        </div>
      )}
    </div>
  );
}

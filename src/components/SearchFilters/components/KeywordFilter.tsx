import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { KEYWORD_OPTIONS } from '@/types/search';
import { styles } from '../SearchFilters.styles';

interface KeywordFilterProps {
  selectedKeywords: string[];
  onToggle: (keyword: string) => void;
  maxVisible?: number;
}

export function KeywordFilter({ 
  selectedKeywords, 
  onToggle, 
  maxVisible = 6 
}: KeywordFilterProps) {
  return (
    <div>
      <h3 className={styles.sectionHeaderWithIcon}>
        <Sparkles className={styles.iconSmall} />
        Keywords
      </h3>
      <div className={styles.keywordBadgesGrid}>
        {KEYWORD_OPTIONS.slice(0, maxVisible).map(({ value, label, icon }) => {
          const isSelected = selectedKeywords.includes(value);
          return (
            <Badge
              key={value}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                styles.keywordBadge,
                isSelected && styles.keywordBadgeSelected
              )}
              onClick={() => onToggle(value)}
            >
              {icon} {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

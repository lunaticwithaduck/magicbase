import { DollarSign, Scale, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TYPE_OPTIONS, SORT_OPTIONS, FORMAT_OPTIONS } from '@/types/search';

// Local imports
import { useSearchFilters } from './hooks/useSearchFilters';
import { styles } from './SearchFilters.styles';
import { ActiveFiltersBar } from './components/ActiveFiltersBar';
import { RecentSearches } from './components/RecentSearches';
import { QuickFilters } from './components/QuickFilters';
import { ColorFilter } from './components/ColorFilter';
import { RarityFilter } from './components/RarityFilter';
import { KeywordFilter } from './components/KeywordFilter';
import { RangeFilter } from './components/RangeFilter';

interface SearchFiltersProps {
  className?: string;
}

export function SearchFilters({ className }: SearchFiltersProps) {
  const {
    filters,
    recentSearches,
    activeFiltersCount,
    handleColorToggle,
    handleRarityToggle,
    handleTypeChange,
    handleSortChange,
    handleFormatChange,
    handleReset,
    handleApplyFilters,
    handleKeywordToggle,
    handleRangeChange,
    handleQuerySelect,
    handleClearRecentSearches,
  } = useSearchFilters();

  return (
    <div className={cn(styles.container, className)}>
      {/* Active Filters */}
      <ActiveFiltersBar count={activeFiltersCount} onClear={handleReset} />

      {/* Recent Searches */}
      <RecentSearches
        searches={recentSearches}
        onSelect={handleQuerySelect}
        onClear={handleClearRecentSearches}
      />

      {/* Quick Filters */}
      <QuickFilters onApply={handleApplyFilters} />

      <Separator />

      {/* Colors */}
      <ColorFilter
        selectedColors={filters.colors || []}
        onToggle={handleColorToggle}
      />

      {filters.colors && filters.colors.length > 0 && (
        <div className="mt-2">
          <Select
            value={filters.colorMatch || 'include'}
            onValueChange={(v) =>
              handleApplyFilters({ colorMatch: v as 'exact' | 'include' | 'atMost' })
            }
          >
            <SelectTrigger className={styles.selectTriggerSmall}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include these colors</SelectItem>
              <SelectItem value="exact">Exactly these colors</SelectItem>
              <SelectItem value="atMost">At most these colors</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      {/* Card Type */}
      <div>
        <h3 className={styles.sectionHeader}>Card Type</h3>
        <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPE_OPTIONS.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Rarity */}
      <RarityFilter
        selectedRarities={filters.rarity || []}
        onToggle={handleRarityToggle}
      />

      <Separator />

      {/* Mana Value */}
      <RangeFilter
        label="Mana Value"
        minValue={filters.cmc?.min}
        maxValue={filters.cmc?.max}
        onMinChange={(v) => handleRangeChange('cmc', 'min', v)}
        onMaxChange={(v) => handleRangeChange('cmc', 'max', v)}
      />

      {/* Power/Toughness for Creatures */}
      {filters.type === 'Creature' && (
        <>
          <Separator />
          <RangeFilter
            label="Power"
            minValue={filters.power?.min}
            maxValue={filters.power?.max}
            onMinChange={(v) => handleRangeChange('power', 'min', v)}
            onMaxChange={(v) => handleRangeChange('power', 'max', v)}
          />

          <Separator />
          <RangeFilter
            label="Toughness"
            minValue={filters.toughness?.min}
            maxValue={filters.toughness?.max}
            onMinChange={(v) => handleRangeChange('toughness', 'min', v)}
            onMaxChange={(v) => handleRangeChange('toughness', 'max', v)}
          />
        </>
      )}

      <Separator />

      {/* Keywords */}
      <KeywordFilter
        selectedKeywords={filters.keywords || []}
        onToggle={handleKeywordToggle}
      />

      <Separator />

      {/* Format */}
      <div>
        <h3 className={styles.sectionHeaderWithIcon}>
          <Scale className={styles.iconSmall} />
          Format
        </h3>
        <Select value={filters.format || 'all'} onValueChange={handleFormatChange}>
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder="All Formats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Formats</SelectItem>
            {FORMAT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <RangeFilter
        label="Price Range (USD)"
        icon={<DollarSign className={styles.iconSmall} />}
        minValue={filters.priceRange?.min}
        maxValue={filters.priceRange?.max}
        onMinChange={(v) => handleRangeChange('priceRange', 'min', v)}
        onMaxChange={(v) => handleRangeChange('priceRange', 'max', v)}
        step="0.01"
      />

      <Separator />

      {/* Sort */}
      <div>
        <h3 className={styles.sectionHeader}>Sort By</h3>
        <Select value={filters.sortBy || 'name'} onValueChange={handleSortChange}>
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Reset */}
      <Button variant="outline" className={styles.resetButton} onClick={handleReset}>
        <RotateCcw className={styles.iconWithMargin} />
        Reset Filters
      </Button>
    </div>
  );
}

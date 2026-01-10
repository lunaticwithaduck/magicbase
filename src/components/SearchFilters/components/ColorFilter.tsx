import { cn } from '@/lib/utils';
import { COLOR_OPTIONS } from '@/types/search';
import { styles, manaColorClasses } from '../SearchFilters.styles';

interface ColorFilterProps {
  selectedColors: string[];
  onToggle: (color: string) => void;
}

export function ColorFilter({ selectedColors, onToggle }: ColorFilterProps) {
  return (
    <div>
      <h3 className={styles.sectionHeader}>Colors</h3>
      <div className={styles.colorButtonsGrid}>
        {COLOR_OPTIONS.map(({ value, label }) => {
          const isSelected = selectedColors.includes(value);
          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={cn(
                styles.colorButton,
                manaColorClasses[value],
                isSelected ? styles.colorButtonSelected : styles.colorButtonUnselected
              )}
              title={label}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

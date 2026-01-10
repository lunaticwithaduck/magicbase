import { Input } from '@/components/ui/input';
import { styles } from '../SearchFilters.styles';
import type { ReactNode } from 'react';

interface RangeFilterProps {
  label: string;
  icon?: ReactNode;
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  step?: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
}

export function RangeFilter({
  label,
  icon,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = '1',
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
}: RangeFilterProps) {
  return (
    <div>
      <h3 className={icon ? styles.sectionHeaderWithIcon : styles.sectionHeader}>
        {icon}
        {label}
      </h3>
      <div className={styles.rangeInputContainer}>
        <Input
          type="number"
          placeholder={minPlaceholder}
          min={0}
          step={step}
          className={styles.rangeInput}
          value={minValue ?? ''}
          onChange={(e) => onMinChange(e.target.value)}
        />
        <span className={styles.rangeSeparator}>to</span>
        <Input
          type="number"
          placeholder={maxPlaceholder}
          min={0}
          step={step}
          className={styles.rangeInput}
          value={maxValue ?? ''}
          onChange={(e) => onMaxChange(e.target.value)}
        />
      </div>
    </div>
  );
}

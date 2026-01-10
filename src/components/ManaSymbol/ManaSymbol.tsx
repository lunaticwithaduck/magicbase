import { cn } from '@/lib/utils';

interface ManaSymbolProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ManaCostProps {
  cost: string | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SYMBOL_BASE_URL = 'https://svgs.scryfall.io/card-symbols';

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4.5 h-4.5',
  lg: 'w-6 h-6',
};

const getSymbolUrl = (symbol: string): string => {
  const cleaned = symbol.replace(/[{}]/g, '').toUpperCase();
  return `${SYMBOL_BASE_URL}/${cleaned}.svg`;
};

const parseManaCost = (cost: string): string[] => {
  const symbolRegex = /\{([^}]+)\}/g;
  const symbols: string[] = [];
  let match;

  while ((match = symbolRegex.exec(cost)) !== null) {
    symbols.push(match[1]);
  }

  return symbols;
};

export function ManaSymbol({ symbol, size = 'md', className }: ManaSymbolProps) {
  const url = getSymbolUrl(symbol);

  return (
    <img
      src={url}
      alt={symbol}
      title={symbol}
      loading="lazy"
      className={cn(sizeClasses[size], 'inline-block align-middle', className)}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export function ManaCost({ cost, size = 'md', className }: ManaCostProps) {
  if (!cost) return null;

  const symbols = parseManaCost(cost);

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {symbols.map((symbol, index) => (
        <ManaSymbol key={`${symbol}-${index}`} symbol={symbol} size={size} />
      ))}
    </span>
  );
}

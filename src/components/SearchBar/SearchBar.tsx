import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setQuery, addRecentSearch } from '@/store/slices/searchSlice';
import { useAutocompleteCardsQuery } from '@/api/scryfallApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showHints?: boolean;
  className?: string;
}

const SEARCH_HINTS = [
  { label: 'Type', example: 't:creature' },
  { label: 'Color', example: 'c:red' },
  { label: 'CMC', example: 'cmc:3' },
  { label: 'Rarity', example: 'r:mythic' },
  { label: 'Set', example: 's:mkm' },
  { label: 'Power', example: 'pow>=5' },
  { label: 'Oracle', example: 'o:flying' },
  { label: 'Format', example: 'f:commander' },
];

export function SearchBar({
  onSearch,
  placeholder = 'Search for cards...',
  showHints = true,
  className,
}: SearchBarProps) {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.filters.query);

  const [inputValue, setInputValue] = useState(query);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: autocompleteData } = useAutocompleteCardsQuery(inputValue, {
    skip: inputValue.length < 2,
  });

  const suggestions = autocompleteData?.data || [];
  const showAutocomplete = isFocused && suggestions.length > 0 && inputValue.length >= 2;
  const showHintsDropdown = isFocused && showHints && inputValue.length === 0;

  const debouncedSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        dispatch(setQuery(value));
        if (value.trim()) {
          dispatch(addRecentSearch(value));
        }
        onSearch?.(value);
      }, 300);
    },
    [dispatch, onSearch]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);
    debouncedSearch(value);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    dispatch(setQuery(suggestion));
    dispatch(addRecentSearch(suggestion));
    onSearch?.(suggestion);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleHintClick = (hint: string) => {
    const newValue = inputValue ? `${inputValue} ${hint}` : hint;
    setInputValue(newValue);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputValue('');
    dispatch(setQuery(''));
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showAutocomplete) {
      if (e.key === 'Enter') {
        dispatch(setQuery(inputValue));
        dispatch(addRecentSearch(inputValue));
        onSearch?.(inputValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        } else {
          dispatch(setQuery(inputValue));
          dispatch(addRecentSearch(inputValue));
          onSearch?.(inputValue);
          setIsFocused(false);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 h-11 text-base"
          aria-label="Search cards"
          aria-autocomplete="list"
          aria-expanded={showAutocomplete}
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showAutocomplete && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 max-h-80 overflow-y-auto bg-popover border border-border rounded-lg shadow-lg z-50"
            role="listbox"
          >
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <button
                key={suggestion}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors',
                  index === highlightedIndex && 'bg-accent',
                  index !== suggestions.slice(0, 10).length - 1 && 'border-b border-border'
                )}
                onClick={() => handleSelectSuggestion(suggestion)}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}

        {showHintsDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 p-4 bg-popover border border-border rounded-lg shadow-lg z-50"
          >
            <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Search Syntax
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_HINTS.map(({ label, example }) => (
                <button
                  key={example}
                  onClick={() => handleHintClick(example)}
                  title={label}
                  className="px-2.5 py-1 text-xs text-muted-foreground bg-secondary border border-border rounded hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <code className="font-mono">{example}</code>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

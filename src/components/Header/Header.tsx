import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Library, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Search', icon: Search },
    { path: '/decks', label: 'Decks', icon: Library },
    { path: '/sets', label: 'Sets', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background via-background to-background backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 opacity-80" />
      
      <div className="container flex h-14 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link to="/" className="flex items-center gap-2 mr-6 group">
          <div className="relative">
            <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🃏</span>
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            MTG Base
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <Button
                variant="ghost"
                className={cn(
                  'gap-2 relative overflow-hidden transition-all duration-300',
                  location.pathname === path && 'bg-accent text-accent-foreground'
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  location.pathname === path && "text-violet-400"
                )} />
                {label}
                {location.pathname === path && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex-1" />
      </div>
    </header>
  );
}

/**
 * Tailwind style definitions for Header component
 */

export const styles = {
  // Header container
  header: 'sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-r from-background via-background to-background backdrop-blur-xl supports-[backdrop-filter]:bg-background/80',
  
  // Decorative gradient
  gradientLine: 'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 opacity-80',
  
  // Container
  container: 'container flex h-14 items-center px-4',
  
  // Mobile menu button
  mobileMenuButton: 'md:hidden mr-2 transition-all duration-200 hover:scale-110 active:scale-95',
  
  // Logo
  logoLink: 'flex items-center gap-2 mr-6 group',
  logoIcon: 'relative',
  logoEmoji: 'text-2xl group-hover:scale-110 transition-transform inline-block',
  logoSparkle: 'absolute -top-1 -right-1 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity',
  logoText: 'font-bold text-lg hidden sm:inline bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent',
  
  // Navigation
  nav: 'hidden md:flex items-center gap-1',
  navButton: 'gap-2 relative overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95',
  navButtonActive: 'bg-accent text-accent-foreground',
  navIcon: 'h-4 w-4 transition-colors',
  navIconActive: 'text-violet-400',
  navIndicator: 'absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full',
  
  // Spacer
  spacer: 'flex-1',
  
  // Theme toggle
  themeButton: 'transition-all duration-200 hover:bg-accent/50 hover:scale-110 active:scale-95',
  sunIcon: 'h-5 w-5 text-amber-400 transition-transform duration-300 hover:rotate-90',
  moonIcon: 'h-5 w-5 text-violet-400 transition-transform duration-300 hover:-rotate-12',
  
  // Icon sizes
  iconSmall: 'h-4 w-4',
  iconMedium: 'h-5 w-5',
} as const;

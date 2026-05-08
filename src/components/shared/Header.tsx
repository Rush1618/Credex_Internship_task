// Header.tsx
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <Zap className="h-4 w-4 text-primary" />
          SpendLens
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Powered by Credex
          </a>
        </div>
      </div>
    </header>
  );
}

// Header.tsx
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 w-full overflow-x-hidden">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-10 w-10 brand-gradient rounded-xl shadow-[0_0_15px_oklch(0.55_0.22_265_/_30%)] flex items-center justify-center font-black text-xl transform transition-transform group-hover:scale-105 group-hover:rotate-3 text-white">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-foreground leading-none">SpendLens</span>
            <span className="text-[8px] font-bold text-primary uppercase tracking-widest mt-1 opacity-80">Intelligence Engine</span>
          </div>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-6 sm:gap-10 shrink-0">
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link
              href="/#how-it-works"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:tracking-[0.15em] whitespace-nowrap"
            >
              Process
            </Link>
            <Link
              href="/#features"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:tracking-[0.15em] whitespace-nowrap"
            >
              Capabilities
            </Link>
            <Link
              href="/audit"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:tracking-[0.15em] whitespace-nowrap"
            >
              Audit
            </Link>
            <Link
              href="/contact"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all hover:tracking-[0.15em] whitespace-nowrap"
            >
              Contact
            </Link>
            <Link
              href="/audit"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all hover:shadow-[0_0_25px_oklch(0.55_0.22_265_/_40%)] transform active:scale-95 whitespace-nowrap"
            >
              Launch Auditor
            </Link>
          </nav>

          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground hover:text-foreground transition-colors hidden xl:block opacity-50 hover:opacity-100 pl-4 border-l border-border"
          >
            By Credex
          </a>
        </div>
      </div>
    </header>
  );
}

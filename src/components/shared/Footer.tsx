// Footer.tsx
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
            <div className="h-7 w-7 brand-gradient rounded-lg flex items-center justify-center font-black text-xs text-white">S</div>
            <div>
              <span className="font-black text-sm tracking-tighter uppercase text-foreground">SpendLens</span>
              <span className="text-[8px] text-muted-foreground block uppercase tracking-widest">by Credex</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-8 flex-wrap justify-center">
            <Link href="/audit" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
              Audit
            </Link>
            <Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
              Credex
            </a>
            <a href="https://github.com/Rush1618/Credex_Internship_task" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
              GitHub
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground" suppressHydrationWarning>
            © {new Date().getFullYear()} SpendLens
          </p>
        </div>
      </div>
    </footer>
  );
}

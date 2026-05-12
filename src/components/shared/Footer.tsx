// Footer.tsx
export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black py-12 relative overflow-hidden">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-2 opacity-50">
          <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center font-black text-xs">S</div>
          <span className="font-bold text-sm tracking-tighter uppercase">SpendLens</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <a href="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Contact</a>
          <a href="https://credex.rocks" target="_blank" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">Credex</a>
        </nav>

        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600" suppressHydrationWarning>
          © {new Date().getFullYear()} Autonomous Spend Audit Protocol
        </p>
      </div>
    </footer>
  );
}

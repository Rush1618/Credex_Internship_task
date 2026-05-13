'use client';

import { SpendForm } from '@/components/SpendForm';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BarChart3, Shield, Zap, Terminal, TrendingDown } from 'lucide-react';

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-inter selection:bg-primary/20">
      <Header />

      <main className="flex-1 pt-32 pb-24 px-6 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 opacity-50 pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-20">
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_oklch(0.55_0.22_265_/_10%)]">
                <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
                Live: Neural Engine v4.0 Active
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none italic text-foreground">
                CORE AUDIT <br />
                <span className="text-primary">TERMINAL.</span>
              </h1>

              <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl font-medium leading-tight">
                Instantly identify subscription overlaps and capital leakage across your AI stack.
                <span className="text-foreground font-bold"> Professional-grade analysis. Zero login.</span>
              </p>

              <div className="flex flex-wrap gap-10 pt-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Privacy</h4>
                    <p className="text-sm font-bold text-foreground">Local Enclave Only</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</h4>
                    <p className="text-sm font-bold text-foreground">Market Manifest 72h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="p-10 rounded-[3rem] bg-card border border-border space-y-6 relative overflow-hidden group shadow-sm">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Terminal className="w-40 h-40 text-primary" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground relative z-10">THE PROTOCOL</h3>
                <div className="space-y-4 relative z-10">
                  {[
                    "Initialize stack ingestion parameters.",
                    "Execute 1,000+ pricing permutations.",
                    "Extract boardroom-ready PDF summary."
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-all">0{i+1}</div>
                      <p className="text-sm font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Terminal */}
          <div className="relative z-10">
            <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full scale-75 pointer-events-none" />
            <div className="relative p-1 md:p-1.5 rounded-[4rem] bg-gradient-to-br from-border via-border/50 to-transparent border border-border shadow-2xl">
              <div className="bg-card rounded-[3.5rem] p-8 md:p-20 border border-border">
                <SpendForm />
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Leakage Detected", value: "$4.2M+", icon: TrendingDown },
              { label: "Audits Completed", value: "12,400+", icon: BarChart3 },
              { label: "Active Models", value: "850+", icon: Zap }
            ].map((stat, i) => (
              <div key={i} className="p-8 rounded-3xl bg-card border border-border flex items-center justify-between group hover:shadow-md transition-all">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-10 w-10 text-border group-hover:text-primary/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

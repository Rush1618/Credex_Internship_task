import { SpendForm } from '@/components/SpendForm';
import { SimulatedSavings } from '@/components/SimulatedSavings';
import ExperienceScene from '@/components/Experience3D';
import { Footer } from '@/components/shared/Footer';
import { CheckCircle2, TrendingDown, Zap, Shield, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Header } from '@/components/shared/Header';

export const metadata: Metadata = {
  title: 'SpendLens — AI Spend Auditor for High-Growth Teams',
  description: 'Instantly find where your AI budget is leaking. Pro-grade audit of Cursor, Copilot, Claude, and more.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 font-inter">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex flex-col overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0 hero-gradient" />
        <div className="absolute inset-0 z-0">
          <ExperienceScene />
        </div>

        <Header />

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
          <div className="max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-[0_0_15px_oklch(0.55_0.22_265_/_10%)]">
              <Zap className="h-3 w-3 fill-current animate-pulse" />
              Live: Neural Engine V4 Sync
            </div>

            <h1 className="text-7xl md:text-[10rem] font-black tracking-[-0.05em] mb-8 leading-[0.85] bg-gradient-to-b from-foreground via-foreground to-foreground/20 bg-clip-text text-transparent drop-shadow-2xl">
              PRECISION <br />
              <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">AUDITING.</span>
            </h1>

            <p className="text-muted-foreground text-xl md:text-3xl max-w-3xl mx-auto mb-14 leading-tight font-medium tracking-tight">
              Instantly eliminate AI budget leakage. Professional-grade audits for Cursor, Copilot, and Claude in{' '}
              <span className="text-foreground font-bold underline decoration-primary/50 underline-offset-8">under 60 seconds.</span>
            </p>

            <div className="mb-14 relative group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10">
                <SimulatedSavings />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/audit"
                className="group relative px-12 py-5 bg-primary hover:opacity-90 text-primary-foreground rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_50px_oklch(0.55_0.22_265_/_30%)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Initiate Scan <TrendingDown className="h-4 w-4" />
                </span>
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Free for teams under 50</span>
            </div>
          </div>
        </main>
      </div>

      {/* Trust Matrix */}
      <section className="py-16 bg-muted/30 relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-6 relative z-10">
          <p className="text-center text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Industrial Grade Security Architecture</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-30 hover:opacity-60 transition-opacity">
            {['VERCEL', 'SUPABASE', 'LINEAR', 'CLAUDE', 'ANTHROPIC'].map(brand => (
              <span key={brand} className="text-xl md:text-2xl font-black tracking-tighter italic text-foreground">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Grid */}
      <section id="features" className="py-40 container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic text-foreground">CAPABILITIES.</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: BarChart3,
              title: "Leakage Analysis",
              desc: "Identify redundant seats and hidden plan overlaps that standard billing dashboards miss.",
              color: "blue"
            },
            {
              icon: TrendingDown,
              title: "Capital Projection",
              desc: "Translate monthly waste into annual growth capital, building a business case for consolidation.",
              color: "indigo"
            },
            {
              icon: Shield,
              title: "Zero-Trust Privacy",
              desc: "No login. No cookies. Audit data persists in your secure local enclave and is never transmitted.",
              color: "purple"
            }
          ].map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-10 -translate-y-10 group-hover:opacity-100 opacity-50 transition-opacity" />
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Protocol */}
      <section id="how-it-works" className="py-40 bg-muted/20 border-y border-border relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter italic text-foreground">THE PROTOCOL.</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20 relative">
            {[
              { step: "01", title: "Stack Ingestion", desc: "Map your current AI tool distribution and team demographics." },
              { step: "02", title: "Core Computation", desc: "Engine iterates 1,000+ pricing permutations for maximum yield." },
              { step: "03", title: "PDF Extraction", desc: "Generate a boardroom-ready PDF summary of your optimization path." }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="text-8xl font-black text-foreground/5 absolute -top-16 -left-4 group-hover:text-primary/10 transition-colors">{step.step}</div>
                <h4 className="text-2xl font-black mb-4 relative z-10 text-foreground">{step.title}</h4>
                <p className="text-muted-foreground text-lg leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40 container mx-auto px-6 max-w-4xl border-t border-border">
        <h2 className="text-4xl font-black mb-20 text-center tracking-tighter uppercase italic text-foreground">Encryption &amp; Integrity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {[
            { q: "Why is this public?", a: "SpendLens is an open-access utility powered by Credex. Our mission is to accelerate AI adoption by eliminating procurement waste." },
            { q: "Data Sovereignty?", a: "All computation occurs in-browser. We never ingest PII or billing keys. Your audit is your property, locally encrypted." },
            { q: "Support Cycle?", a: "The engine consumes updated pricing manifests every 72 hours to account for market shifts in OpenAI and Anthropic tiers." },
            { q: "Custom Models?", a: "Enterprise users can inject custom LLM pricing schemas into the auditor terminal via JSON manifest upload." }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <h4 className="text-lg font-black text-foreground flex items-center gap-3">
                <span className="h-2 w-2 bg-primary rounded-full" />
                {item.q}
              </h4>
              <p className="text-muted-foreground leading-relaxed font-medium">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exit CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_100%)]" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-10 text-primary-foreground tracking-tighter">STOP THE <br /> BLEEDING.</h2>
          <p className="text-primary-foreground/80 text-xl md:text-2xl mb-14 max-w-2xl mx-auto font-medium">
            Join 500+ efficiency-first teams who have consolidated their AI stack with SpendLens.
          </p>
          <Link
            href="/audit"
            className="px-16 py-6 bg-primary-foreground text-primary rounded-full font-black text-sm uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-2xl transform hover:scale-110 active:scale-95 inline-block"
          >
            Launch Audit Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

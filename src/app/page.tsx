import { SpendForm } from '@/components/SpendForm';
import { SimulatedSavings } from '@/components/SimulatedSavings';
import ExperienceScene from '@/components/Experience3D';
import { Footer } from '@/components/shared/Footer';
import { CheckCircle2, TrendingDown, Zap, Shield, BarChart3, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpendLens — AI Spend Auditor for High-Growth Teams',
  description: 'Instantly find where your AI budget is leaking. Pro-grade audit of Cursor, Copilot, Claude, and more.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,50,1)_0%,rgba(0,0,0,1)_100%)]">
          <ExperienceScene />
        </div>
        
        <header className="relative z-10 border-b border-white/5 bg-slate-950/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center font-bold text-xl">S</div>
              <span className="font-bold text-2xl tracking-tighter text-white">SpendLens</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#auditor" className="px-5 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-slate-200 transition-colors">Start Audit</a>
            </nav>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="h-3 w-3 fill-current" />
              New: OpenRouter Integration Live
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
              Stop Leaking <br /> AI Budget.
            </h1>
            <p className="text-slate-300 text-lg md:text-2xl max-w-2xl mx-auto mb-8 leading-relaxed drop-shadow-sm">
              Instantly audit your team's AI tool spend. Find overlaps between Cursor, Copilot, and Claude in under 60 seconds.
            </p>
            
            <div className="mb-10">
              <SimulatedSavings />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#auditor" className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20">
                Run Free Audit
              </a>
            </div>
          </div>
          
        </main>
      </div>

      {/* Social Proof */}
      <section className="py-20 border-y border-white/5 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <p className="text-center text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Trusted by founders at</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale contrast-200">
            <span className="text-2xl font-bold">Vercel</span>
            <span className="text-2xl font-bold">Supabase</span>
            <span className="text-2xl font-bold">Linear</span>
            <span className="text-2xl font-bold">OpenRouter</span>
            <span className="text-2xl font-bold">Anthropic</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="space-y-4">
            <div className="h-12 w-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold">Waste Detection</h3>
            <p className="text-slate-400 leading-relaxed">
              Our engine identifies redundant seats and plan overlaps that standard billing dashboards miss.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold">Annual Projections</h3>
            <p className="text-slate-400 leading-relaxed">
              We translate monthly waste into annual savings, helping you build a business case for stack consolidation.
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold">Privacy First</h3>
            <p className="text-slate-400 leading-relaxed">
              No login required. We use localStorage for persistence and never share your audit data without permission.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-900/30 border-y border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-20 tracking-tight">Audit in three steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <div className="relative">
              <div className="h-12 w-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-xl shadow-white/10">1</div>
              <h4 className="text-xl font-bold mb-3">Input your stack</h4>
              <p className="text-slate-400">Tell us what AI tools you pay for and your current team size.</p>
            </div>
            <div className="relative">
              <div className="h-12 w-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-xl shadow-white/10">2</div>
              <h4 className="text-xl font-bold mb-3">Get the audit</h4>
              <p className="text-slate-400">Our engine runs 1,000+ pricing permutations to find the optimal setup.</p>
            </div>
            <div className="relative">
              <div className="h-12 w-12 bg-white text-black rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6 shadow-xl shadow-white/10">3</div>
              <h4 className="text-xl font-bold mb-3">Save thousands</h4>
              <p className="text-slate-400">Capture your report and book a consultation for high-savings cases.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Auditor Section */}
      <section id="auditor" className="py-32 container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Start Your Audit</h2>
          <p className="text-slate-400 text-lg">No credit card. No login. Just facts.</p>
        </div>
        
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-1 shadow-2xl shadow-blue-500/10">
          <div className="bg-slate-950 rounded-[22px] p-6 md:p-10">
            <SpendForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked</h2>
        <div className="space-y-8">
          <div className="space-y-2">
            <h4 className="text-lg font-bold">Why is this free?</h4>
            <p className="text-slate-400">SpendLens is a lead-gen tool for Credex. We want to show you the value of smart procurement. If we find you $5,000+ in savings, we hope you'll talk to us.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold">Is my data secure?</h4>
            <p className="text-slate-400">Yes. Audits are stored with unique UUIDs. We only collect your email if you choose to capture the report. We never sell your data.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold">Which tools do you support?</h4>
            <p className="text-slate-400">We currently support Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, and several AI APIs. We update our pricing data weekly.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 text-white">Ready to optimize?</h2>
          <p className="text-blue-100 text-xl mb-12 max-w-xl mx-auto">Join 500+ teams who have optimized their AI stack with SpendLens.</p>
          <a href="#auditor" className="px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:bg-slate-100 transition-all shadow-2xl">
            Launch Audit Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

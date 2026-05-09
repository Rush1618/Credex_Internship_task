'use client';

import { useState } from 'react';
import { AuditResult } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { SummaryStat } from './SummaryStat';

export { RecommendationCard, SummaryStat };
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrendingDown, Calendar, AlertTriangle, CheckCircle2, ExternalLink, Sparkles, Printer, Share2, ArrowRight, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AuditResultsProps {
  uuid: string;
  result: AuditResult;
  aiSummary?: string;
}

export function AuditResults({ uuid, result, aiSummary }: AuditResultsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const {
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    redundancyWarnings,
  } = result;

  const handlePrint = () => {
    window.print();
  };

  const isOptimalSpend = totalMonthlySavings < 100 && recommendations.every((r) => r.isOptimal);

  const retainList = recommendations.filter((r) => r.isOptimal || r.savingsType === 'optimization');
  const actionList = recommendations.filter((r) => !r.isOptimal && r.savingsType !== 'optimization');

  return (
    <div className="space-y-12 font-sans max-w-5xl mx-auto">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10 no-print">
        <div className="space-y-2">
          <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full text-[10px] italic bg-blue-500/5">
            Audit Terminal Active
          </Badge>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Intelligence Report</h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">ID: {uuid.slice(0, 12)} · Verified {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-8 rounded-2xl border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-white font-black uppercase tracking-widest text-[10px] italic gap-3 transition-all transform hover:-translate-y-1"
            onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Intelligence Link Copied'); }}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button 
            size="lg" 
            className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] italic gap-3 shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-1"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" /> Print Audit
          </Button>
        </div>
      </div>

      {/* Row 1: AI Summary + Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {aiSummary && (
          <section className="lg:col-span-8 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="h-24 w-24 text-blue-500" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autonomous Synthesis</span>
                </div>
                <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 font-black italic uppercase tracking-widest text-[9px] px-3">
                  OpenRouter / LLM-4
                </Badge>
              </div>
              <p className="text-lg leading-relaxed text-slate-300 font-medium italic tracking-tight">
                &ldquo;{aiSummary}&rdquo;
              </p>
            </div>
          </section>
        )}

        <section className="lg:col-span-4 rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 flex flex-col justify-between items-center text-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Confidence Rating</span>
            <div className="relative">
              <span className={`text-7xl font-black italic tracking-tighter ${
                result.confidenceScore > 85 ? 'text-blue-400'
                : result.confidenceScore > 70 ? 'text-amber-400'
                : 'text-rose-400'
              }`}>
                {result.confidenceScore}<span className="text-3xl opacity-50">%</span>
              </span>
              <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full opacity-50" />
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed max-w-[180px]">
              Validated against global market indices and resource scale.
            </p>
          </div>
        </section>
      </div>

      {/* Benchmark Strip */}
      {result.benchmarkInfo && (
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-blue-600" />
          <div className="relative h-28 w-28 flex-shrink-0">
            <div className="absolute inset-0 border-[6px] border-blue-500/10 rounded-full" />
            <div className="absolute inset-0 border-[6px] border-blue-500 border-t-transparent rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-white italic tracking-tighter">
                {result.benchmarkInfo.percentile}<span className="text-sm opacity-50 italic">%</span>
              </span>
            </div>
          </div>

          <div className="flex-1 text-center lg:text-left space-y-3">
            <Badge className="bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1 rounded-full italic">
              {result.benchmarkInfo.status} EFFICIENCY
            </Badge>
            <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{result.benchmarkInfo.comparisonText}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Operational rank: <span className="text-white italic">Top {100 - result.benchmarkInfo.percentile}% of global peers</span>
            </p>
          </div>

          <div className="hidden lg:block w-px h-16 bg-white/10" />

          <div className="text-center lg:text-right shrink-0 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Trajectory Path</span>
            <p className="text-sm font-black text-blue-400 uppercase tracking-tighter italic flex items-center justify-center lg:justify-end gap-2">
              Optimization Target: Elite 1% <ArrowRight className="h-4 w-4" />
            </p>
          </div>
        </section>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-[2.5rem] border border-blue-500/10 bg-blue-500/[0.02] flex flex-col items-center text-center space-y-4">
          <TrendingDown className="h-10 w-10 text-blue-400" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Monthly Yield</span>
            <p className="text-5xl font-black text-white tracking-tighter italic">{formatCurrency(totalMonthlySavings)}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Immediate operational burn reduction</p>
        </div>
        <div className="p-10 rounded-[2.5rem] border border-purple-500/10 bg-purple-500/[0.02] flex flex-col items-center text-center space-y-4">
          <Calendar className="h-10 w-10 text-purple-400" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Annual Recapture</span>
            <p className="text-5xl font-black text-white tracking-tighter italic">{formatCurrency(totalAnnualSavings)}</p>
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Total liquidity returned over 12 months</p>
        </div>
      </div>

      {/* Intelligence Grid: Retain / Replace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4" /> Retain Protocol
            </h4>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-black italic">OPTIMAL</Badge>
          </div>
          <div className="space-y-4">
            {retainList.length === 0
              ? <p className="text-xs text-slate-600 font-bold uppercase italic tracking-widest">No optimal assets detected.</p>
              : retainList.map((r) => (
                <div key={r.toolName} className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{r.toolName}</span>
                  <div className="h-px flex-1 mx-4 bg-emerald-500/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Verified</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-rose-500/20 bg-rose-500/[0.02] p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4" /> Action Protocol
            </h4>
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] font-black italic">MODIFICATION REQ</Badge>
          </div>
          <div className="space-y-4">
            {actionList.length === 0
              ? <p className="text-xs text-slate-600 font-bold uppercase italic tracking-widest">No immediate actions required.</p>
              : actionList.map((r) => (
                <div key={r.toolName} className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase italic tracking-tight">{r.toolName}</span>
                  <div className="h-px flex-1 mx-4 bg-rose-500/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 italic">Action Required</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Redundancy Alerts */}
      {redundancyWarnings.length > 0 && (
        <section className="rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.02] p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Redundancy Breach Detected</h4>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Cross-platform feature overlap analysis</p>
            </div>
          </div>
          <ul className="space-y-4">
            {redundancyWarnings.map((warning, i) => (
              <li key={i} className="text-sm text-slate-300 font-medium italic border-l-2 border-amber-500/30 pl-6 py-1">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* High Savings CTA */}
      <section className="rounded-[3rem] overflow-hidden border border-blue-500/20 bg-[#050505] relative no-print shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)]" />
        <div className="p-12 space-y-8 relative z-10">
          <div className="space-y-4">
            <Badge className="bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[9px] px-5 py-1.5 rounded-full italic">High Yield Opportunity</Badge>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
              Capture <span className="text-blue-500">{formatCurrency(totalMonthlySavings)}</span> / month now.
            </h2>
            <p className="text-lg text-slate-400 font-medium tracking-tight max-w-2xl leading-relaxed">
              Plan downgrades are just the surface. Credex autonomously negotiates volume clusters and credit injection directly with vendor APIs. Elite teams capture an additional <span className="text-white italic">15–25%</span> via our private protocol.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a
              href="https://credex.rocks/book"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-16 inline-flex items-center justify-center gap-4 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all px-10 text-xs font-black text-white uppercase tracking-[0.2em] italic shadow-[0_20px_50px_rgba(59,130,246,0.3)] transform hover:-translate-y-1"
            >
              Unlock Private Protocol
              <Zap className="h-4 w-4 fill-current" />
            </a>
            <div className="flex flex-col items-center sm:items-start opacity-40">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Zero Commitment</span>
              <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">30 Minute Intelligence Briefing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Breakdown */}
      <section className="space-y-10 pt-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Asset Breakdown</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Granular optimization path for every neural asset</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 opacity-30 italic">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Engine Verified</span>
          </div>
        </div>

        <div className="space-y-8">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.toolName} recommendation={rec} />
          ))}
        </div>
      </section>

      <footer className="pt-20 pb-10 text-center space-y-4 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
          <span className="h-px w-12 bg-white/10" />
          Autonomous Spend Intelligence
          <span className="h-px w-12 bg-white/10" />
        </div>
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
          Market index verified 2026-05-09 · Results reflect public API pricing and tier structures · Credex (SpendLens) is an autonomous protocol for enterprise capital efficiency.
        </p>
      </footer>
    </div>
  );
}

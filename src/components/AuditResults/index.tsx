'use client';

import { useState, useEffect } from 'react';
import { AuditResult } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { SummaryStat } from './SummaryStat';

export { RecommendationCard, SummaryStat };
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrendingDown, Calendar, AlertTriangle, CheckCircle2, ExternalLink, Sparkles, Download, Share2, ArrowRight, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AuditResultsProps {
  uuid: string;
  result: AuditResult;
  aiSummary?: string;
}

export function AuditResults({ uuid, result, aiSummary }: AuditResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    redundancyWarnings,
  } = result;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/audit/${uuid}/export`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detailedError = errorData.message || errorData.error || `Status ${response.status}`;
        throw new Error(detailedError);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Report_${uuid.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(`Failed to generate PDF: ${err.message || 'Unknown error'}.`);
    } finally {
      setIsExporting(false);
    }
  };

  const isOptimalSpend = totalMonthlySavings < 100 && recommendations.every((r) => r.isOptimal);
  const retainList = recommendations.filter((r) => r.isOptimal || r.savingsType === 'optimization');
  const actionList = recommendations.filter((r) => !r.isOptimal && r.savingsType !== 'optimization');

  return (
    <div className="space-y-12 font-sans max-w-5xl mx-auto">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-border no-print">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full text-[10px] italic bg-primary/5">
            Audit Terminal Active
          </Badge>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Intelligence Report</h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
            ID: {uuid.slice(0, 12)} · {mounted ? `Verified ${new Date().toLocaleDateString()}` : 'Verifying...'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] italic gap-3 transition-all transform hover:-translate-y-1"
            onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Intelligence Link Copied'); }}
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button
            size="lg"
            disabled={isExporting}
            className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] italic gap-3 transition-all transform hover:-translate-y-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Download Audit'}
          </Button>
        </div>
      </div>

      {/* Row 1: AI Summary + Confidence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {aiSummary && (
          <section className="lg:col-span-8 rounded-[2.5rem] border border-border bg-card p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-24 w-24 text-primary" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Autonomous Synthesis</span>
              </div>
              <p className="text-lg leading-relaxed text-foreground/80 font-medium italic tracking-tight">
                &ldquo;{aiSummary}&rdquo;
              </p>
            </div>
          </section>
        )}

        <section className="lg:col-span-4 rounded-[2.5rem] border border-border bg-card p-10 flex flex-col justify-between items-center text-center relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Confidence Rating</span>
            <div className="relative">
              <span className={`text-7xl font-black italic tracking-tighter ${
                result.confidenceScore > 85 ? 'text-primary'
                : result.confidenceScore > 70 ? 'text-amber-500'
                : 'text-destructive'
              }`}>
                {result.confidenceScore}<span className="text-3xl opacity-50">%</span>
              </span>
              <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full opacity-50" />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-[180px]">
              Validated against global market indices and resource scale.
            </p>
          </div>
        </section>
      </div>

      {/* Benchmark Strip */}
      {result.benchmarkInfo && (
        <section className="rounded-[2.5rem] border border-border bg-card p-10 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-2 bg-primary" />
          <div className="relative h-28 w-28 flex-shrink-0">
            <div className="absolute inset-0 border-[6px] border-primary/10 rounded-full" />
            <div className="absolute inset-0 border-[6px] border-primary border-t-transparent rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-foreground italic tracking-tighter">
                {result.benchmarkInfo.percentile}<span className="text-sm opacity-50 italic">%</span>
              </span>
            </div>
          </div>
          <div className="flex-1 text-center lg:text-left space-y-3">
            <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[9px] px-4 py-1 rounded-full italic">
              {result.benchmarkInfo.status} EFFICIENCY
            </Badge>
            <p className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{result.benchmarkInfo.comparisonText}</p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Operational rank: <span className="text-foreground italic">Top {100 - result.benchmarkInfo.percentile}% of global peers</span>
            </p>
          </div>
          <div className="hidden lg:block w-px h-16 bg-border" />
          <div className="text-center lg:text-right shrink-0 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Trajectory Path</span>
            <p className="text-sm font-black text-primary uppercase tracking-tighter italic flex items-center justify-center lg:justify-end gap-2">
              Optimization Target: Elite 1% <ArrowRight className="h-4 w-4" />
            </p>
          </div>
        </section>
      )}

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-[2.5rem] border border-primary/20 bg-primary/5 flex flex-col items-center text-center space-y-4">
          <TrendingDown className="h-10 w-10 text-primary" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Monthly Yield</span>
            <p className="text-5xl font-black text-foreground tracking-tighter italic">{formatCurrency(totalMonthlySavings)}</p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Immediate operational burn reduction</p>
        </div>
        <div className="p-10 rounded-[2.5rem] border border-indigo-500/20 bg-indigo-500/5 flex flex-col items-center text-center space-y-4">
          <Calendar className="h-10 w-10 text-indigo-500" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Annual Recapture</span>
            <p className="text-5xl font-black text-foreground tracking-tighter italic">{formatCurrency(totalAnnualSavings)}</p>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total liquidity returned over 12 months</p>
        </div>
      </div>

      {/* Intelligence Grid: Retain / Replace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-[2.5rem] border border-emerald-500/20 bg-emerald-500/5 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4" /> Retain Protocol
            </h4>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9px] font-black italic">OPTIMAL</Badge>
          </div>
          <div className="space-y-4">
            {retainList.length === 0
              ? <p className="text-xs text-muted-foreground font-bold uppercase italic tracking-widest">No optimal assets detected.</p>
              : retainList.map((r) => (
                <div key={r.toolName} className="flex items-center justify-between">
                  <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{r.toolName}</span>
                  <div className="h-px flex-1 mx-4 bg-emerald-500/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-500/60">Verified</span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600 dark:text-rose-400 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4" /> Action Protocol
            </h4>
            <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[9px] font-black italic">MODIFICATION REQ</Badge>
          </div>
          <div className="space-y-4">
            {actionList.length === 0
              ? <p className="text-xs text-muted-foreground font-bold uppercase italic tracking-widest">No immediate actions required.</p>
              : actionList.map((r) => (
                <div key={r.toolName} className="flex items-center justify-between">
                  <span className="text-sm font-black text-foreground uppercase italic tracking-tight">{r.toolName}</span>
                  <div className="h-px flex-1 mx-4 bg-rose-500/10" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-rose-600/60 dark:text-rose-500/60 italic">Action Required</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Redundancy Alerts */}
      {redundancyWarnings.length > 0 && (
        <section className="rounded-[2.5rem] border border-amber-500/20 bg-amber-500/5 p-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 dark:text-amber-500">Redundancy Breach Detected</h4>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Cross-platform feature overlap analysis</p>
            </div>
          </div>
          <ul className="space-y-4">
            {redundancyWarnings.map((warning, i) => (
              <li key={i} className="text-sm text-foreground/80 font-medium italic border-l-2 border-amber-500/30 pl-6 py-1">
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* High Savings CTA */}
      <section className="rounded-[3rem] overflow-hidden border border-primary/20 bg-card relative no-print shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.55_0.22_265_/_10%),transparent_70%)]" />
        <div className="p-12 space-y-8 relative z-10">
          <div className="space-y-4">
            <Badge className="bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[9px] px-5 py-1.5 rounded-full italic">High Yield Opportunity</Badge>
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-none">
              Capture <span className="text-primary">{formatCurrency(totalMonthlySavings)}</span> / month now.
            </h2>
            <p className="text-lg text-muted-foreground font-medium tracking-tight max-w-2xl leading-relaxed">
              Plan downgrades are just the surface. Credex autonomously negotiates volume clusters and credit injection directly with vendor APIs. Elite teams capture an additional <span className="text-foreground italic">15–25%</span> via our private protocol.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <a
              href="https://credex.rocks/book"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-16 inline-flex items-center justify-center gap-4 rounded-2xl bg-primary hover:opacity-90 transition-all px-10 text-xs font-black text-primary-foreground uppercase tracking-[0.2em] italic shadow-[0_20px_50px_oklch(0.55_0.22_265_/_30%)] transform hover:-translate-y-1"
            >
              Unlock Private Protocol
              <Zap className="h-4 w-4 fill-current" />
            </a>
            <div className="flex flex-col items-center sm:items-start opacity-40">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zero Commitment</span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">30 Minute Intelligence Briefing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Breakdown */}
      <section className="space-y-10 pt-10">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">Asset Breakdown</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Granular optimization path for every neural asset</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 opacity-30 italic text-foreground">
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
        <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          <span className="h-px w-12 bg-border" />
          Autonomous Spend Intelligence
          <span className="h-px w-12 bg-border" />
        </div>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
          Market index verified 2026-05-09 · Results reflect public API pricing and tier structures · Credex (SpendLens) is an autonomous protocol for enterprise capital efficiency.
        </p>
      </footer>
    </div>
  );
}

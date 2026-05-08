'use client';

import { AuditResult } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { SummaryStat } from './SummaryStat';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrendingDown, Calendar, AlertTriangle, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AuditResultsProps {
  result: AuditResult;
  aiSummary?: string;
}

export function AuditResults({ result, aiSummary }: AuditResultsProps) {
  const {
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    redundancyWarnings,
    isHighSavings,
  } = result;

  const isOptimalSpend = totalMonthlySavings < 100 && recommendations.every((r) => r.isOptimal);

  return (
    <div className="space-y-10">
      {/* AI Summary & Trust Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiSummary && (
          <section className="md:col-span-2 rounded-xl border border-border bg-muted/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI Analysis
              </div>
              <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                Powered by <span className="font-semibold">OpenRouter</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{aiSummary}</p>
          </section>
        )}
        
        <section className="rounded-xl border border-border bg-muted/20 p-5 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audit Confidence</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${
                result.confidenceScore > 85 ? 'text-emerald-600' : 
                result.confidenceScore > 70 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {result.confidenceScore}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Based on team size alignment and current tool market pricing.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2 text-xs"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Audit link copied to clipboard!');
              }}
            >
              <ExternalLink className="h-3 w-3" />
              Share Report
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-2 text-xs"
              onClick={() => window.print()}
            >
              <TrendingDown className="h-3 w-3" />
              Download PDF
            </Button>
          </div>
        </section>

        {/* Benchmark Card */}
        {result.benchmarkInfo && (
          <section className="col-span-1 lg:col-span-3 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-shrink-0">
              <div className="h-20 w-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{result.benchmarkInfo.percentile}%</span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground border-2 border-card">
                <TrendingDown className="h-3 w-3" />
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Badge variant={result.benchmarkInfo.status === 'OPTIMAL' ? 'default' : result.benchmarkInfo.status === 'BLOATED' ? 'destructive' : 'secondary'}>
                  {result.benchmarkInfo.status} SPEND
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">Peer Benchmark</span>
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {result.benchmarkInfo.comparisonText}
              </h3>
              <p className="text-sm text-muted-foreground">
                You are in the <span className="text-foreground font-medium">top {100 - result.benchmarkInfo.percentile}%</span> of efficient teams in our database for your size.
              </p>
            </div>

            <div className="hidden lg:block w-px h-12 bg-border" />

            <div className="text-center sm:text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Potential Rank</p>
              <p className="text-sm text-primary font-medium">
                Actioning these savings moves you to the <span className="font-bold">top 1%</span>.
              </p>
            </div>
          </section>
        )}

        {/* Consolidation Plan */}
        <section className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              Retain & Optimize
            </h4>
            <ul className="space-y-2">
              {result.recommendations.filter(r => r.isOptimal || r.savingsType === 'optimization').map(r => (
                <li key={r.toolName} className="text-sm flex items-center justify-between">
                  <span className="capitalize font-medium">{r.toolName}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">Optimal</Badge>
                </li>
              ))}
              {result.recommendations.filter(r => r.isOptimal || r.savingsType === 'optimization').length === 0 && (
                <li className="text-xs text-muted-foreground italic">No optimal tools found.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              Replace or Cancel
            </h4>
            <ul className="space-y-2">
              {result.recommendations.filter(r => !r.isOptimal && r.savingsType !== 'optimization').map(r => (
                <li key={r.toolName} className="text-sm flex items-center justify-between">
                  <span className="capitalize font-medium">{r.toolName}</span>
                  <Badge variant="destructive" className="text-[10px] uppercase">Action Required</Badge>
                </li>
              ))}
              {result.recommendations.filter(r => !r.isOptimal && r.savingsType !== 'optimization').length === 0 && (
                <li className="text-xs text-muted-foreground italic">No tools require immediate action.</li>
              )}
            </ul>
          </div>
        </section>
      </div>

      {/* Stats Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryStat
          label="Estimated Monthly Savings"
          value={formatCurrency(totalMonthlySavings)}
          icon={TrendingDown}
          description="Immediate reduction in monthly burn"
        />
        <SummaryStat
          label="Projected Annual Savings"
          value={formatCurrency(totalAnnualSavings)}
          icon={Calendar}
          description="Total cash returned to business per year"
        />
      </section>

      {/* Well-Optimised State (<$100 savings) */}
      {isOptimalSpend && (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h2 className="font-semibold text-emerald-800">You&apos;re spending well.</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Your AI subscriptions are well-matched to your team size and use case.
              We found less than $100/month in potential savings — below the threshold
              where switching costs justify acting immediately. Sign up below and
              we&apos;ll notify you when better options emerge for your stack.
            </p>
          </div>
        </section>
      )}

      {/* Redundancy Alerts */}
      {redundancyWarnings.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            Redundancy Alerts
          </div>
          <ul className="space-y-2">
            {redundancyWarnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span className="shrink-0">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* High Savings Credex CTA (>$500/mo) */}
      {isHighSavings && (
        <section className="rounded-xl overflow-hidden border border-primary/20 shadow-lg">
          <div className="bg-primary px-6 py-5 text-primary-foreground">
            <Badge variant="secondary" className="mb-3 text-xs">High Savings Detected</Badge>
            <h2 className="text-xl font-bold">
              You could save {formatCurrency(totalMonthlySavings)}/month.
              <br />Credex can capture even more.
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-2">
              On top of plan downgrades, Credex negotiates volume discounts and credit
              bundles directly with vendors. Teams like yours typically unlock an additional
              15–25% on top of these savings.
            </p>
          </div>
          <div className="bg-background px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a
              href="https://credex.rocks/book"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Book a free Credex consultation
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-xs text-muted-foreground">No commitment. 30 minutes. We do the analysis.</span>
          </div>
        </section>
      )}

      {/* Recommendation Cards */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Tool-by-Tool Breakdown</h2>
          <p className="text-sm text-muted-foreground">
            Current plan → recommended action → savings and reasoning.
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.toolName} recommendation={rec} />
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        Recommendations based on public pricing verified 2026-05-07.
        Always confirm current enterprise terms with tool providers before acting.
      </p>

      <style jsx global>{`
        @media print {
          nav, header, footer, .no-print, button, .LeadCapture {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .AuditResults {
            margin: 0 !important;
            padding: 0 !important;
          }
          .rounded-xl {
            border-radius: 0 !important;
            border: 1px solid #eee !important;
          }
        }
      `}</style>
    </div>
  );
}

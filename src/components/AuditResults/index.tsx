'use client';

import { AuditResult } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { SummaryStat } from './SummaryStat';
import { formatCurrency } from '@/lib/utils';
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

      {/* ── AI Summary ──────────────────────────────────────────────────── */}
      {aiSummary && (
        <section className="rounded-xl border border-border bg-muted/40 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            AI Analysis
          </div>
          <p className="text-sm leading-relaxed">{aiSummary}</p>
        </section>
      )}

      {/* ── Stats Dashboard ─────────────────────────────────────────────── */}
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

      {/* ── Well-Optimised State (<$100 savings) ────────────────────────── */}
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

      {/* ── Redundancy Alerts ───────────────────────────────────────────── */}
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

      {/* ── High Savings Credex CTA (>$500/mo) ──────────────────────────── */}
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

      {/* ── Recommendation Cards ─────────────────────────────────────────── */}
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

      {/* ── Disclaimer ──────────────────────────────────────────────────── */}
      <p className="text-center text-xs text-muted-foreground max-w-md mx-auto">
        Recommendations based on public pricing verified 2026-05-07.
        Always confirm current enterprise terms with tool providers before acting.
      </p>
    </div>
  );
}

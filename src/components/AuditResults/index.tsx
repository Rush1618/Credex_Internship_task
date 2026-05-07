'use client';

import { AuditResult } from '@/types';
import { RecommendationCard } from './RecommendationCard';
import { SummaryStat } from './SummaryStat';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, Calendar, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AuditResultsProps {
  result: AuditResult;
}

export function AuditResults({ result }: AuditResultsProps) {
  const {
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations,
    redundancyWarnings,
    isHighSavings,
  } = result;

  return (
    <div className="space-y-10">
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

      {/* High Savings Banner */}
      {isHighSavings && (
        <div className="rounded-xl bg-primary px-6 py-8 text-primary-foreground text-center space-y-2 shadow-lg shadow-primary/20">
          <h3 className="text-xl font-bold italic">High Efficiency Potential Detected</h3>
          <p className="text-primary-foreground/90 text-sm">
            You are currently spending significantly more than necessary for your team size.
            Following these recommendations could save you over $500 per month.
          </p>
        </div>
      )}

      {/* Recommendation List */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Personalized Recommendations</h2>
          <p className="text-sm text-muted-foreground">
            A tool-by-tool breakdown of your current spending vs. optimal setup.
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
        Recommendations are based on public pricing as of May 2024.
        Always verify specific enterprise terms with tool providers.
      </p>
    </div>
  );
}

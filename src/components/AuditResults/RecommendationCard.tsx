'use client';

import { ToolRecommendation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: ToolRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const {
    toolName,
    currentPlan,
    recommendedPlan,
    savingsType,
    monthlySavings,
    reasoning,
    isOptimal,
  } = recommendation;

  const badgeLabel =
    savingsType === 'downgrade' ? 'Downscale Protocol'
    : savingsType === 'consolidation' ? 'Consolidation'
    : 'Optimization';

  return (
    <div className={`group rounded-[2rem] border transition-all duration-500 overflow-hidden ${
      isOptimal 
        ? 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]' 
        : 'border-blue-500/20 bg-blue-500/[0.02] hover:border-blue-500/40 hover:bg-blue-500/[0.04] shadow-2xl'
    }`}>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${
              isOptimal ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {isOptimal ? <ShieldCheck className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">{toolName}</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">Operational Node</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
            <span className="text-slate-500">{currentPlan}</span>
            {!isOptimal && (
              <>
                <ArrowRight className="h-4 w-4 text-blue-500" />
                <span className="text-blue-400 italic">{recommendedPlan}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {isOptimal ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black italic uppercase tracking-[0.2em] px-5 py-1.5 rounded-full">
              Optimal Efficiency
            </Badge>
          ) : (
            <>
              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black italic uppercase tracking-[0.2em] px-5 py-1.5 rounded-full">
                {badgeLabel}
              </Badge>
              <div className="flex items-center gap-2 text-rose-400 font-black italic">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xl tracking-tighter">-{formatCurrency(monthlySavings)}<span className="text-xs opacity-50 ml-1">/mo</span></span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reasoning List */}
      <div className="p-8 space-y-6">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Intelligence Briefing</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {reasoning.map((item, i) => (
            <div key={i} className="flex gap-4 group/item">
              <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 transition-all group-hover/item:scale-150 ${
                isOptimal ? 'bg-emerald-500/40' : 'bg-blue-500/40'
              }`} />
              <p className="text-sm font-medium text-slate-400 group-hover/item:text-slate-200 transition-colors leading-relaxed italic">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-footer if optimal */}
      {isOptimal && (
        <div className="px-8 py-4 bg-white/[0.01] border-t border-white/5">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest text-center">
            Matched to current market benchmark for 98th percentile organizations.
          </p>
        </div>
      )}
    </div>
  );
}

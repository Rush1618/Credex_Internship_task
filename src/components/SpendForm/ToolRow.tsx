'use client';

import { ToolInput, ToolName } from '@/types';
import { TOOL_PRICING } from '@/lib/pricing-data';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Zap, Sparkles, Terminal, GitBranch, Search, Users, DollarSign, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOL_LABELS: Record<ToolName, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

interface ToolRowProps {
  tool: ToolInput;
  index: number;
  onChange: (index: number, updated: ToolInput) => void;
  onRemove: (index: number) => void;
}

export function ToolRow({ tool, index, onChange, onRemove }: ToolRowProps) {
  const plans = TOOL_PRICING[tool.name] ?? [];

  const update = (field: keyof ToolInput, value: string | number) => {
    let updatedTool = { ...tool, [field]: value };

    if (field === 'plan' || field === 'seats') {
      const selectedPlan = plans.find(p => p.planId === (field === 'plan' ? value : tool.plan));
      if (selectedPlan && !selectedPlan.isEnterprise) {
        const seats = field === 'seats' ? (value as number) : tool.seats;
        const newSpend = (selectedPlan.pricePerUserPerMonth * seats) + selectedPlan.flatMonthlyPrice;
        updatedTool.monthlySpend = Math.round(newSpend * 100) / 100;
      }
    }

    onChange(index, updatedTool);
  };

  const getIcon = () => {
    switch (tool.name) {
      case 'chatgpt': return <Zap className="h-5 w-5" />;
      case 'claude': return <Sparkles className="h-5 w-5" />;
      case 'cursor': return <Terminal className="h-5 w-5" />;
      case 'github-copilot': return <GitBranch className="h-5 w-5" />;
      case 'windsurf': return <Search className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="group relative rounded-[3rem] border border-white/5 bg-white/[0.01] p-10 backdrop-blur-md transition-all hover:bg-white/[0.03] hover:border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute -top-3 -right-3 h-10 w-10 flex items-center justify-center bg-[#0a0a0a] border border-white/10 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-xl z-20"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center">
        {/* Left Column: Identity & Tier */}
        <div className="xl:col-span-5 flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[2rem] bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-transform group-hover:scale-105 group-hover:rotate-3 duration-500">
            {getIcon()}
          </div>
          <div className="space-y-5 flex-1 w-full">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">{TOOL_LABELS[tool.name]}</h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Asset Sync Active</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Subscription Protocol</Label>
              <Select value={tool.plan} onValueChange={(v) => v && update('plan', v)}>
                <SelectTrigger className="h-14 bg-white/[0.02] border-white/5 text-white rounded-2xl font-bold px-6 focus:ring-blue-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                  {plans.map((p) => (
                    <SelectItem key={p.planId} value={p.planId} className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">
                      {p.planLabel}{p.isEnterprise ? ' (Custom)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Node Capacity</Label>
            <div className="relative group/input">
              <Users className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700 group-focus-within/input:text-blue-500 transition-colors" />
              <input
                type="number"
                min="1"
                value={tool.seats || ''}
                onChange={(e) => update('seats', parseInt(e.target.value, 10) || 1)}
                className="w-full h-16 bg-white/[0.02] border border-white/5 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 text-white rounded-2xl pl-16 pr-6 outline-none transition-all font-bold text-lg"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Resource Burn / Mo</Label>
            <div className="relative group/input">
              <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700 group-focus-within/input:text-emerald-500 transition-colors" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={tool.monthlySpend || ''}
                onChange={(e) => update('monthlySpend', parseFloat(e.target.value) || 0)}
                className="w-full h-16 bg-white/[0.02] border border-white/5 focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 text-emerald-400 rounded-2xl pl-16 pr-6 outline-none transition-all font-black text-lg"
              />
            </div>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            <div className="flex gap-4">
              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Tier: {plans.find(p => p.planId === tool.plan)?.planLabel || 'Custom'}
              </div>
              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Unit: ${((tool.monthlySpend || 0) / (tool.seats || 1)).toFixed(2)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white tracking-tighter italic">
                ${(tool.monthlySpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ToolInput, ToolName } from '@/types';
import { TOOL_PRICING } from '@/lib/pricing-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Zap, Sparkles, Terminal, GitBranch, Search, Palette, Users, DollarSign } from 'lucide-react';

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

    // Smart logic: auto-calculate spend when plan or seats change
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
      default: return <span className="font-black italic">{tool.name.charAt(0).toUpperCase()}</span>;
    }
  };

  return (
    <div className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 shadow-2xl transition-all hover:bg-white/[0.04] hover:border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Remove button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => onRemove(index)}
          className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
          aria-label={`Remove ${TOOL_LABELS[tool.name]}`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Tool Branding */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-transform group-hover:scale-110">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">{TOOL_LABELS[tool.name]}</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Neural Asset {index + 1}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Protocol Tier</Label>
            <Select value={tool.plan} onValueChange={(v) => v && update('plan', v)}>
              <SelectTrigger className="h-14 bg-white/[0.03] border-white/10 text-white rounded-2xl font-bold px-5">
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                {plans.map((p) => (
                  <SelectItem key={p.planId} value={p.planId} className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">
                    {p.planLabel}{p.isEnterprise ? ' (Custom)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Financial Parameters */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">User Capacity</Label>
            <div className="relative group/input">
              <Users className="absolute left-5 h-4 w-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
              <input
                type="number"
                min="1"
                step="1"
                value={tool.seats || ''}
                onChange={(e) => update('seats', parseInt(e.target.value, 10) || 1)}
                className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl pl-14 pr-5 outline-none transition-all font-bold placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Total Monthly Burn</Label>
            <div className="relative group/input">
              <DollarSign className="absolute left-5 h-4 w-4 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={tool.monthlySpend || ''}
                onChange={(e) => update('monthlySpend', parseFloat(e.target.value) || 0)}
                className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-blue-400/50 focus:ring-4 focus:ring-blue-400/10 text-blue-400 rounded-2xl pl-14 pr-5 outline-none transition-all font-black placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="sm:col-span-2 p-6 rounded-[2rem] bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Resource Efficiency Index</span>
              <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest italic">Autonomous verification active</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-white tracking-tighter italic">
                ${(tool.monthlySpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-black text-slate-600 ml-3 uppercase tracking-widest italic">USD / MO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

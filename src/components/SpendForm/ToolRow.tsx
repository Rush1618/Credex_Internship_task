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
import { X } from 'lucide-react';

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

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-6 transition-all hover:bg-white/[0.05] hover:border-white/10">
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        aria-label={`Remove ${TOOL_LABELS[tool.name]}`}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Tool Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/20 shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110">
          {TOOL_LABELS[tool.name].charAt(0)}
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-lg text-white tracking-tight leading-none">
            {TOOL_LABELS[tool.name]}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
            Official Pricing Sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Plan selector */}
        <div className="space-y-2">
          <Label htmlFor={`plan-${index}`} className="text-xs font-bold uppercase tracking-widest text-slate-500">Plan</Label>
          <Select value={tool.plan} onValueChange={(v) => v && update('plan', v)}>
            <SelectTrigger id={`plan-${index}`} className="h-11 bg-slate-950/50 border-white/5 focus:ring-blue-500/20 text-white font-medium">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {plans.map((p) => (
                <SelectItem key={p.planId} value={p.planId} className="focus:bg-blue-600 focus:text-white">
                  {p.planLabel}
                  {p.isEnterprise ? ' (Custom)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Seats */}
        <div className="space-y-2">
          <Label htmlFor={`seats-${index}`} className="text-xs font-bold uppercase tracking-widest text-slate-500">Seats / users</Label>
          <div className="relative">
            <Input
              id={`seats-${index}`}
              type="number"
              min="1"
              step="1"
              placeholder="1"
              value={tool.seats || ''}
              onChange={(e) => update('seats', parseInt(e.target.value, 10) || 1)}
              className="h-11 bg-slate-950/50 border-white/5 focus:ring-blue-500/20 text-white font-medium"
            />
          </div>
        </div>

        {/* Monthly spend */}
        <div className="space-y-2">
          <Label htmlFor={`spend-${index}`} className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Total Monthly spend
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">$</span>
            <Input
              id={`spend-${index}`}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={tool.monthlySpend || ''}
              onChange={(e) => update('monthlySpend', parseFloat(e.target.value) || 0)}
              className="pl-8 h-11 bg-slate-950/50 border-white/5 focus:ring-blue-500/20 text-blue-400 font-bold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuditInput, ToolInput, ToolName, UseCase, TeamSize } from '@/types';
import { runAudit } from '@/lib/audit-engine';
import { clearFormDraft, useFormPersist } from './FormPersist';
import { ToolRow } from './ToolRow';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Zap } from 'lucide-react';
import { TOOL_PRICING } from '@/lib/pricing-data';

const ALL_TOOLS: ToolName[] = [
  'cursor',
  'github-copilot',
  'claude',
  'chatgpt',
  'anthropic-api',
  'openai-api',
  'gemini',
  'windsurf',
];

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

const DEFAULT_FORM: AuditInput = {
  email: '',
  company: '',
  tools: [],
  teamSize: '2-5',
  useCase: 'coding',
};

function makeDefaultTool(name: ToolName): ToolInput {
  const plans = TOOL_PRICING[name] || [];
  // Pick a sensible default plan: 'pro' if it exists, else the first non-free plan, else the first plan.
  let defaultPlan = plans.find(p => p.planId === 'pro' || p.planId === 'plus' || p.planId === 'individual');
  if (!defaultPlan) defaultPlan = plans.find(p => p.pricePerUserPerMonth > 0 || p.flatMonthlyPrice > 0);
  if (!defaultPlan) defaultPlan = plans[0];

  const planId = defaultPlan?.planId || 'pro';
  const seats = defaultPlan?.minSeats || 1;
  const spend = defaultPlan ? (defaultPlan.pricePerUserPerMonth * seats) + defaultPlan.flatMonthlyPrice : 0;

  return { 
    name, 
    plan: planId, 
    monthlySpend: Math.round(spend * 100) / 100, 
    seats 
  };
}

export function SpendForm() {
  const router = useRouter();
  const [form, setForm] = useState<AuditInput>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFormPersist(form, setForm);

  const addTool = (name: ToolName) => {
    if (form.tools.find((t) => t.name === name)) return; // already added
    setForm((f) => ({ ...f, tools: [...f.tools, makeDefaultTool(name)] }));
  };

  const updateTool = (index: number, updated: ToolInput) => {
    setForm((f) => {
      const tools = [...f.tools];
      tools[index] = updated;
      return { ...f, tools };
    });
  };

  const removeTool = (index: number) => {
    setForm((f) => ({ ...f, tools: f.tools.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!form.email || !form.email.includes('@')) {
      setError('Please provide a valid work email.');
      return;
    }
    if (!form.company) {
      setError('Please provide your company name.');
      return;
    }
    if (form.tools.length === 0) {
      setError('Add at least one tool to audit.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const auditResult = runAudit(form);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditInput: form, auditResult }),
      });

      if (!res.ok) throw new Error('Failed to save audit');
      const { uuid } = await res.json();
      clearFormDraft();
      router.push(`/audit/${uuid}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const availableTools = ALL_TOOLS.filter(
    (t) => !form.tools.find((f) => f.name === t)
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-16">
      {/* Step 1 — Team context */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 text-sm font-black border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] italic">
            01
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Institutional Context</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Define the operational parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3 sm:col-span-2 group">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-500 transition-colors">Corporate Intelligence Email</Label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="identity@enterprise.ai"
                value={form.email || ''}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-5 outline-none transition-all font-medium placeholder:text-slate-700"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          <div className="space-y-3 group">
            <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-500 transition-colors">Organization</Label>
            <div className="relative">
              <input
                id="company"
                type="text"
                placeholder="Global Corp"
                value={form.company || ''}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full h-14 bg-white/[0.03] border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-5 outline-none transition-all font-medium placeholder:text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="teamSize" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Resource Scale</Label>
            <Select
              value={form.teamSize}
              onValueChange={(v) => setForm((f) => ({ ...f, teamSize: v as TeamSize }))}
            >
              <SelectTrigger id="teamSize" className="h-14 bg-white/[0.03] border-white/10 focus:ring-blue-500/10 text-white rounded-2xl px-5 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                <SelectItem value="1" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Solo (1)</SelectItem>
                <SelectItem value="2-5" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Alpha (2–5)</SelectItem>
                <SelectItem value="6-20" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Squad (6–20)</SelectItem>
                <SelectItem value="20-100" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Growth (20–100)</SelectItem>
                <SelectItem value="100+" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Enterprise (100+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 sm:col-span-2">
            <Label htmlFor="useCase" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Primary Objective</Label>
            <Select
              value={form.useCase}
              onValueChange={(v) => setForm((f) => ({ ...f, useCase: v as UseCase }))}
            >
              <SelectTrigger id="useCase" className="h-14 bg-white/[0.03] border-white/10 focus:ring-blue-500/10 text-white rounded-2xl px-5 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                <SelectItem value="coding" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">System Engineering</SelectItem>
                <SelectItem value="writing" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Content Synthesis</SelectItem>
                <SelectItem value="data" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Data Intelligence</SelectItem>
                <SelectItem value="research" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">Exploratory Research</SelectItem>
                <SelectItem value="mixed" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-3">General Utility</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Step 2 — Tools */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <div className="flex items-center gap-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 text-sm font-black border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] italic">
            02
          </div>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Inventory Manifest</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select active neural assets</p>
          </div>
        </div>

        {/* Tool chips to add */}
        {availableTools.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {availableTools.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTool(t)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-white transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-lg"
              >
                <Plus className="h-3.5 w-3.5 text-blue-500" />
                {TOOL_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Added tools */}
        {form.tools.length > 0 && (
          <div className="space-y-6 pt-4">
            {form.tools.map((tool, i) => (
              <div key={tool.name} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <ToolRow
                  tool={tool}
                  index={i}
                  onChange={updateTool}
                  onRemove={removeTool}
                />
              </div>
            ))}
          </div>
        )}

        {form.tools.length === 0 && (
          <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] p-16 text-center text-xs font-black uppercase tracking-[0.3em] text-slate-600 animate-pulse">
            Initialize manifest by selecting assets above
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
          CRITICAL ERROR: {error}
        </div>
      )}

      {/* Submit */}
      <div className="pt-10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || form.tools.length === 0}
          className="group relative w-full h-20 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Intelligence...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 fill-current animate-pulse text-blue-200" />
                <span>Execute Final Audit</span>
              </>
            )}
          </div>
        </button>
      </div>

      <div className="flex flex-col items-center gap-6 pt-6">
        <p className="text-center text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">
          End-to-End Encryption · Autonomous Engine · Zero Friction
        </p>
        <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Core Engine by</span>
          <span className="text-xs font-black text-white tracking-tighter italic">OPENROUTER INTEL</span>
        </div>
      </div>
    </div>
  );
}

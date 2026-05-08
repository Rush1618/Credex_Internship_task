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
    <div className="w-full max-w-2xl mx-auto space-y-12">
      {/* Step 1 — Team context */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 text-sm font-bold border border-blue-500/20 shadow-lg shadow-blue-500/10">
            01
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight">Your Context</h2>
            <p className="text-sm text-slate-500">Tell us about your team and use case</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-500">Work Email</Label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={form.email || ''}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full h-11 bg-slate-900/50 border border-white/5 focus:ring-2 focus:ring-blue-500/20 text-white rounded-md px-3 outline-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-xs font-bold uppercase tracking-widest text-slate-500">Company Name</Label>
            <input
              id="company"
              type="text"
              placeholder="Acme Corp"
              value={form.company || ''}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              className="w-full h-11 bg-slate-900/50 border border-white/5 focus:ring-2 focus:ring-blue-500/20 text-white rounded-md px-3 outline-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize" className="text-xs font-bold uppercase tracking-widest text-slate-500">Team size</Label>
            <Select
              value={form.teamSize}
              onValueChange={(v) => setForm((f) => ({ ...f, teamSize: v as TeamSize }))}
            >
              <SelectTrigger id="teamSize" className="h-11 bg-slate-900/50 border-white/5 focus:ring-blue-500/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="1" className="focus:bg-blue-600">Solo (1)</SelectItem>
                <SelectItem value="2-5" className="focus:bg-blue-600">Small (2–5)</SelectItem>
                <SelectItem value="6-20" className="focus:bg-blue-600">Mid (6–20)</SelectItem>
                <SelectItem value="20-100" className="focus:bg-blue-600">Growth (20–100)</SelectItem>
                <SelectItem value="100+" className="focus:bg-blue-600">Large (100+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="useCase" className="text-xs font-bold uppercase tracking-widest text-slate-500">Primary use case</Label>
            <Select
              value={form.useCase}
              onValueChange={(v) => setForm((f) => ({ ...f, useCase: v as UseCase }))}
            >
              <SelectTrigger id="useCase" className="h-11 bg-slate-900/50 border-white/5 focus:ring-blue-500/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10 text-white">
                <SelectItem value="coding" className="focus:bg-blue-600">Coding / Engineering</SelectItem>
                <SelectItem value="writing" className="focus:bg-blue-600">Writing / Content</SelectItem>
                <SelectItem value="data" className="focus:bg-blue-600">Data / Analytics</SelectItem>
                <SelectItem value="research" className="focus:bg-blue-600">Research</SelectItem>
                <SelectItem value="mixed" className="focus:bg-blue-600">Mixed / General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Step 2 — Tools */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 text-purple-400 text-sm font-bold border border-purple-500/20 shadow-lg shadow-purple-500/10">
            02
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight">AI Stack</h2>
            <p className="text-sm text-slate-500">Select the tools you currently pay for</p>
          </div>
        </div>

        {/* Tool chips to add */}
        {availableTools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTools.map((t) => (
              <button
                key={t}
                onClick={() => addTool(t)}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.05] hover:border-white/10 hover:text-white transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="h-3.5 w-3.5" />
                {TOOL_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Added tools */}
        {form.tools.length > 0 && (
          <div className="space-y-4 pt-2">
            {form.tools.map((tool, i) => (
              <div key={tool.name} className="animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
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
          <div className="rounded-2xl border border-dashed border-white/5 bg-white/[0.01] p-12 text-center text-sm text-slate-500">
            Click a tool above to begin your audit
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="pt-6">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || form.tools.length === 0}
          className="w-full gap-3 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Running AI Synthesis…
            </div>
          ) : (
            <>
              <Zap className="h-5 w-5 fill-current" />
              Generate Audit Report
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 pt-4">
        <p className="text-center text-xs text-slate-500 font-medium">
          No account required · Private by default · Results in under 60s
        </p>
        <div className="flex items-center gap-4 opacity-30">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Powered by</span>
          <span className="text-xs font-bold text-white tracking-tighter">OpenRouter</span>
        </div>
      </div>
    </div>
  );
}

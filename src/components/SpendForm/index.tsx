'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AuditInput, ToolInput, ToolName, UseCase, TeamSize } from '@/types';
import { runAudit } from '@/lib/audit-engine';
import { clearFormDraft, useFormPersist } from './FormPersist';
import { ToolRow } from './ToolRow';
import { Zap, ChevronRight, ChevronLeft, ShieldCheck, Cpu, Database, LayoutPanelLeft, LineChart, Globe, Search, Sparkles, Terminal, GitBranch, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TOOL_PRICING } from '@/lib/pricing-data';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const TOOL_ICONS: Record<ToolName, LucideIcon> = {
  cursor: Terminal,
  'github-copilot': GitBranch,
  claude: Sparkles,
  chatgpt: Zap,
  'anthropic-api': Cpu,
  'openai-api': LayoutPanelLeft,
  gemini: Globe,
  windsurf: Search,
};

const DEFAULT_FORM: AuditInput = {
  email: '',
  company: '',
  tools: [],
  teamSize: '2-5',
  useCase: 'coding',
};

function getInitialSeats(size: TeamSize): number {
  switch (size) {
    case '1': return 1;
    case '2-5': return 3;
    case '6-20': return 10;
    case '20-100': return 50;
    case '100+': return 150;
    default: return 1;
  }
}

function makeDefaultTool(name: ToolName, teamSize: TeamSize): ToolInput {
  const plans = TOOL_PRICING[name] || [];
  let defaultPlan = plans.find(p => p.planId === 'pro' || p.planId === 'plus' || p.planId === 'individual');
  if (!defaultPlan) defaultPlan = plans.find(p => p.pricePerUserPerMonth > 0 || p.flatMonthlyPrice > 0);
  if (!defaultPlan) defaultPlan = plans[0];

  const planId = defaultPlan?.planId || 'pro';
  const seats = Math.max(defaultPlan?.minSeats || 1, getInitialSeats(teamSize));
  const spend = defaultPlan ? (defaultPlan.pricePerUserPerMonth * seats) + defaultPlan.flatMonthlyPrice : 0;

  return { 
    name, 
    plan: planId, 
    monthlySpend: Math.round(spend * 100) / 100, 
    seats 
  };
}

type Step = 'context' | 'inventory' | 'review';

export function SpendForm() {
  const router = useRouter();
  const [form, setForm] = useState<AuditInput>(DEFAULT_FORM);
  const [step, setStep] = useState<Step>('context');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFormPersist(form, setForm);

  const addTool = (name: ToolName) => {
    if (form.tools.find((t) => t.name === name)) return;
    setForm((f) => ({ ...f, tools: [...f.tools, makeDefaultTool(name, f.teamSize)] }));
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

  const handleTeamSizeChange = (newSize: TeamSize) => {
    const newSeats = getInitialSeats(newSize);
    setForm((f) => ({
      ...f,
      teamSize: newSize,
      tools: f.tools.map((t) => {
        const plans = TOOL_PRICING[t.name] || [];
        const currentPlan = plans.find(p => p.planId === t.plan) || plans[0];
        const updatedSeats = Math.max(currentPlan?.minSeats || 1, newSeats);
        const updatedSpend = currentPlan 
          ? (currentPlan.pricePerUserPerMonth * updatedSeats) + currentPlan.flatMonthlyPrice 
          : t.monthlySpend;
        
        return {
          ...t,
          seats: updatedSeats,
          monthlySpend: Math.round(updatedSpend * 100) / 100
        };
      })
    }));
  };

  const validateStep = (currentStep: Step) => {
    if (currentStep === 'context') {
      if (!form.email || !form.email.includes('@')) {
        setError('Valid corporate email required for protocol initialization.');
        return false;
      }
      if (!form.company) {
        setError('Organization identity missing.');
        return false;
      }
    }
    if (currentStep === 'inventory') {
      if (form.tools.length === 0) {
        setError('At least one neural asset must be registered.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 'context') setStep('inventory');
      else if (step === 'inventory') setStep('review');
    }
  };

  const prevStep = () => {
    if (step === 'inventory') setStep('context');
    else if (step === 'review') setStep('inventory');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep('review')) return;
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
    } catch (_err) {
      setError('Neural link synchronization failed. Re-attempting...');
      setIsSubmitting(false);
    }
  };


  const totalSpend = useMemo(() => 
    form.tools.reduce((acc, t) => acc + (t.monthlySpend || 0), 0),
    [form.tools]
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10 relative">
      {/* Progress Bar */}
      <div className="flex justify-between items-center px-2 mb-12 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-white/5 z-0" />
        {[
          { id: 'context', icon: Globe, label: 'Context' },
          { id: 'inventory', icon: Database, label: 'Inventory' },
          { id: 'review', icon: ShieldCheck, label: 'Review' },
        ].map((s) => {
          const isActive = step === s.id;
          const isDone = (step === 'inventory' && s.id === 'context') || (step === 'review' && (s.id === 'context' || s.id === 'inventory'));
          return (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                isActive ? "bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] scale-110" : 
                isDone ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" :
                "bg-white/[0.03] border-white/10 text-slate-500"
              )}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500",
                isActive ? "text-white" : "text-slate-600"
              )}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="min-h-[500px]">
        {/* Step 1 — Context */}
        {step === 'context' && (
          <section className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Intelligence Profile</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Environmental configuration & resource parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl">
              <div className="space-y-3 md:col-span-2 group">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-400 transition-colors">Corporate ID Protocol</Label>
                <input
                  id="email"
                  type="email"
                  placeholder="identity@enterprise.ai"
                  value={form.email || ''}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full h-16 bg-white/[0.03] border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-6 outline-none transition-all font-medium text-lg placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-3 group">
                <Label htmlFor="company" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-400 transition-colors">Organization</Label>
                <input
                  id="company"
                  type="text"
                  placeholder="Global Systems"
                  value={form.company || ''}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full h-16 bg-white/[0.03] border border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-6 outline-none transition-all font-medium text-lg placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="teamSize" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Resource Load</Label>
                <Select
                  value={form.teamSize}
                  onValueChange={(v) => handleTeamSizeChange(v as TeamSize)}
                >
                  <SelectTrigger className="h-16 bg-white/[0.03] border-white/10 text-white rounded-2xl px-6 font-bold text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/10 text-white rounded-2xl shadow-2xl p-2">
                    <SelectItem value="1" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">Solo (1)</SelectItem>
                    <SelectItem value="2-5" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">Core (2–5)</SelectItem>
                    <SelectItem value="6-20" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">Division (6–20)</SelectItem>
                    <SelectItem value="20-100" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">Fleet (20–100)</SelectItem>
                    <SelectItem value="100+" className="rounded-xl focus:bg-blue-600 font-bold uppercase text-[10px] tracking-widest py-4">Enterprise (100+)</SelectItem>
                  </SelectContent>
                </Select>
                {form.teamSize === '100+' && (
                  <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest animate-pulse mt-2 ml-1">
                    Enterprise Protocol Detected: Bulk discounts applicable.
                  </p>
                )}
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operational Focus</Label>
                  <span className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest italic">Core Engine Parameter</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'coding', label: 'Engineering', icon: Cpu },
                    { id: 'writing', label: 'Synthesis', icon: LayoutPanelLeft },
                    { id: 'data', label: 'Intelligence', icon: Database },
                    { id: 'research', label: 'Exploration', icon: Search },
                    { id: 'mixed', label: 'Hybrid', icon: Zap },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, useCase: u.id as UseCase }))}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 group",
                        form.useCase === u.id 
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] scale-[1.02]" 
                          : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/[0.04]"
                      )}
                    >
                      <u.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", form.useCase === u.id ? "text-white" : "text-slate-700")} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{u.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Step 2 — Inventory */}
        {step === 'inventory' && (
          <section className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Neural Manifest</h2>
              <div className="flex items-center gap-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active subscription assets & resource allocation</p>
                <div className="h-px flex-1 bg-white/5" />
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black italic uppercase tracking-widest text-[9px] px-4 py-1 rounded-full">
                  Synced: {form.teamSize} Users
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ALL_TOOLS.map((t) => {
                const isAdded = form.tools.some(f => f.name === t);
                const Icon = TOOL_ICONS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => isAdded ? setForm(f => ({ ...f, tools: f.tools.filter(tool => tool.name !== t) })) : addTool(t)}
                    className={cn(
                      "flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border transition-all duration-300 group relative overflow-hidden",
                      isAdded 
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_10px_30px_rgba(59,130,246,0.15)]" 
                        : "bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/10 hover:bg-white/[0.04] hover:scale-[1.02]"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-500",
                      isAdded ? "bg-blue-500/20 border-blue-500/30 rotate-12" : "bg-white/5 border-white/5 group-hover:rotate-6"
                    )}>
                      <Icon className={cn("h-6 w-6 transition-transform", isAdded ? "text-blue-400" : "text-slate-700")} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">{TOOL_LABELS[t]}</span>
                    {isAdded && (
                      <div className="absolute top-4 right-4 h-2 w-2 bg-blue-400 rounded-full">
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-6 pt-4">
              {form.tools.length > 0 ? (
                form.tools.map((tool, i) => (
                  <ToolRow
                    key={tool.name}
                    tool={tool}
                    index={i}
                    onChange={updateTool}
                    onRemove={removeTool}
                  />
                ))
              ) : (
                <div className="rounded-[3rem] border border-dashed border-white/5 bg-white/[0.01] p-24 text-center">
                  <Cpu className="h-12 w-12 text-slate-800 mx-auto mb-6 opacity-20" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 animate-pulse">Waiting for asset registration...</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Step 3 — Review */}
        {step === 'review' && (
          <section className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="space-y-2 text-center">
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Execution Review</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Final synthesis check before deep-audit</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 space-y-12 backdrop-blur-xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Company</span>
                  <p className="text-xl font-black text-white italic truncate">{form.company}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Scale</span>
                  <p className="text-xl font-black text-white italic">{form.teamSize} Users</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Focus</span>
                  <p className="text-xl font-black text-white italic capitalize">{form.useCase}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Assets</span>
                  <p className="text-xl font-black text-white italic">{form.tools.length} Tools</p>
                </div>
              </div>

              <div className="h-px bg-white/5" />

              <div className="flex flex-col items-center gap-6 py-4">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Calculated Monthly Burn</span>
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full" />
                  <span className="text-7xl font-black text-white tracking-tighter italic relative">
                    ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <LineChart className="h-4 w-4 text-blue-400" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Projected ${ (totalSpend * 12).toLocaleString() } Annualized</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 flex gap-6 items-start">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500">Autonomous Processing Note</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Executing this audit will transmit data to the autonomous neural network for synthesis. No personal PII is stored beyond your corporate identity.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-6 pt-10 relative">
        {error && (
          <div className="absolute -top-6 left-0 right-0 text-center animate-shake">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20">
              Protocol Error: {error}
            </span>
          </div>
        )}

        <div className="flex gap-4">
          {step !== 'context' && (
            <button
              type="button"
              onClick={prevStep}
              className="h-20 px-8 bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 group"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          )}

          {step !== 'review' ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 h-20 bg-white text-black hover:bg-slate-200 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-4 group"
            >
              Initialize Next Phase
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 h-20 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(59,130,246,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing Neural Audit...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-current text-blue-200" />
                    <span>Final Execution</span>
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center gap-6 pt-6 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
          Neural Link Secure · Encryption v4.0 Active
        </p>
      </div>
    </div>
  );
}

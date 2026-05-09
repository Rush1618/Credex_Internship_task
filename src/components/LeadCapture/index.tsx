'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, SendHorizonal, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const schema = z.object({
  email: z.string().email('Operational intelligence email required'),
  companyName: z.string().min(1, 'Entity identification required').max(120),
  role: z.string().min(1, 'Professional designation required').max(80),
  website: z.string().max(0, 'Bot interference detected'),
});

type FormValues = z.infer<typeof schema>;

interface LeadCaptureProps {
  auditUuid: string;
  isHighSavings: boolean;
}

export function LeadCapture({ auditUuid, isHighSavings }: LeadCaptureProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { website: '' } });

  const onSubmit = async (values: FormValues) => {
    if (values.website) return;

    setServerError(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          companyName: values.companyName,
          role: values.role,
          auditUuid,
          isHighSavings,
        }),
      });
      if (!res.ok) throw new Error('server');
      setSubmitted(true);
    } catch {
      setServerError('System synchronisation error. Please retry.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-12 text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="mx-auto h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Access Granted</h3>
          <p className="text-sm font-medium text-slate-400 italic max-w-sm mx-auto leading-relaxed">
            {isHighSavings
              ? "Full savings roadmap deployed. A Credex strategist will initiate contact within 24 hours for private protocol briefing."
              : "Intelligence saved. Autonomous alerts will trigger when market deviations apply to your stack."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[3rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden group">
      <div className="p-10 border-b border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 font-black italic uppercase tracking-widest text-[9px] px-4 py-1 rounded-full">
            Restricted Protocol
          </Badge>
          <ShieldCheck className="h-5 w-5 text-slate-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-tight">
            {isHighSavings
              ? 'Request Full Savings Roadmap'
              : 'Save Intelligence & Monitor Assets'}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic">
            {isHighSavings
              ? "Deploy detailed action plan and unlock Credex advisory for high-value recapture."
              : "Recieve digital audit twin and autonomous alerts for future spend deviations."}
          </p>
        </div>
      </div>

      <div className="p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8" noValidate>
          {/* Honeypot */}
          <div aria-hidden="true" className="hidden">
            <input type="text" {...register('website')} />
          </div>

          {/* Email */}
          <div className="space-y-3 group/field">
            <Label htmlFor="lc-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within/field:text-blue-500 transition-colors ml-1">Work Email</Label>
            <div className="relative">
              <Input
                id="lc-email"
                type="email"
                placeholder="identity@enterprise.ai"
                className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-5 font-bold transition-all"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3 group/field">
            <Label htmlFor="lc-company" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within/field:text-blue-500 transition-colors ml-1">Entity Name</Label>
            <Input
              id="lc-company"
              type="text"
              placeholder="Global Systems"
              className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-5 font-bold transition-all"
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.companyName.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-3 md:col-span-2 group/field">
            <Label htmlFor="lc-role" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within/field:text-blue-500 transition-colors ml-1">Professional Designation</Label>
            <Input
              id="lc-role"
              type="text"
              placeholder="Engineering Lead, CTO, Founder..."
              className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-2xl px-5 font-bold transition-all"
              {...register('role')}
            />
            {errors.role && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.role.message}</p>
            )}
          </div>

          {serverError && (
            <p className="md:col-span-2 text-[10px] font-black text-rose-500 uppercase tracking-widest text-center" role="alert">{serverError}</p>
          )}

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group/btn relative w-full h-16 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] italic shadow-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:grayscale overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Transmission</span>
                    <SendHorizonal className="h-4 w-4" />
                  </>
                )}
              </div>
            </button>
          </div>

          <p className="md:col-span-2 text-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] italic">
            Zero External Data Leaks · Neural Guard Active · Opt-Out Any Time
          </p>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, SendHorizonal, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  monthlySavings: number;
  annualSavings: number;
  initialEmail?: string;
  initialCompanyName?: string;
}

export function LeadCapture({ 
  auditUuid, 
  isHighSavings, 
  monthlySavings, 
  annualSavings,
  initialEmail = '',
  initialCompanyName = ''
}: LeadCaptureProps) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ 
    resolver: zodResolver(schema), 
    defaultValues: { 
      website: '',
      email: initialEmail,
      companyName: initialCompanyName
    } 
  });

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
          monthlySavings,
          annualSavings,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'System synchronisation error');
      }
      
      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'System synchronisation error. Please retry.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[3rem] border border-blue-500/20 bg-blue-500/[0.02] p-12 text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="mx-auto h-20 w-20 rounded-[2rem] bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <Mail className="h-10 w-10 text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Report Transmitted</h3>
          <p className="text-sm font-medium text-slate-400 italic max-w-sm mx-auto leading-relaxed">
            Intelligence deployed. Your detailed Savings Report has been sent to your inbox as a PDF attachment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-[3.5rem] border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden group transition-all duration-500",
      isHighSavings ? "ring-1 ring-blue-500/30" : ""
    )}>
      <div className="p-12 border-b border-white/5 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldCheck className="h-32 w-32 text-blue-500" />
        </div>
        
        <div className="flex items-center justify-between relative z-10">
          <Badge className="bg-blue-600/10 text-blue-400 border-blue-500/20 font-black italic uppercase tracking-widest text-[9px] px-5 py-1.5 rounded-full">
            Restricted Protocol V4
          </Badge>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-75" />
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse delay-150" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">
            {isHighSavings
              ? 'Request Full \nSavings Roadmap'
              : 'Save Intelligence & \nMonitor Assets'}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed italic max-w-md">
            {isHighSavings
              ? "Deploy detailed action plan and unlock Credex advisory for high-value recapture."
              : "Recieve digital audit twin and autonomous alerts for future spend deviations."}
          </p>
        </div>
      </div>

      <div className="p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-10" noValidate>
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
                className="h-16 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-[1.25rem] px-6 font-bold transition-all text-base placeholder:text-slate-800"
                {...register('email')}
              />
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 ml-1 text-rose-500">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-[9px] font-black uppercase tracking-widest">{errors.email.message}</p>
                </div>
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
              className="h-16 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-[1.25rem] px-6 font-bold transition-all text-base placeholder:text-slate-800"
              {...register('companyName')}
            />
            {errors.companyName && (
              <div className="flex items-center gap-2 mt-2 ml-1 text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <p className="text-[9px] font-black uppercase tracking-widest">{errors.companyName.message}</p>
              </div>
            )}
          </div>

          {/* Role */}
          <div className="space-y-3 md:col-span-2 group/field">
            <Label htmlFor="lc-role" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within/field:text-blue-500 transition-colors ml-1">Professional Designation</Label>
            <Input
              id="lc-role"
              type="text"
              placeholder="Engineering Lead, CTO, Founder..."
              className="h-16 bg-white/[0.03] border-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-white rounded-[1.25rem] px-6 font-bold transition-all text-base placeholder:text-slate-800"
              {...register('role')}
            />
            {errors.role && (
              <div className="flex items-center gap-2 mt-2 ml-1 text-rose-500">
                <AlertCircle className="h-3 w-3" />
                <p className="text-[9px] font-black uppercase tracking-widest">{errors.role.message}</p>
              </div>
            )}
          </div>

          {serverError && (
            <div className="md:col-span-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center gap-3 animate-shake">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest" role="alert">{serverError}</p>
            </div>
          )}

          <div className="md:col-span-2 pt-4 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group/btn relative w-full h-20 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] italic shadow-2xl transition-all transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:grayscale overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Transmission</span>
                    <SendHorizonal className="h-5 w-5" />
                  </>
                )}
              </div>
            </button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => window.location.href = '/login'}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-blue-400 transition-colors italic underline underline-offset-4"
              >
                Returning user? Access Intelligence Portal
              </button>
            </div>
          </div>

          <p className="md:col-span-2 text-center text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] italic">
            Zero External Data Leaks · Neural Guard Active · Protocol V4.2.0
          </p>
        </form>
      </div>
    </div>
  );
}

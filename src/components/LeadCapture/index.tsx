'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, SendHorizonal, ShieldCheck, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Valid email required'),
  companyName: z.string().min(1, 'Company name required').max(120),
  role: z.string().min(1, 'Role required').max(80),
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
      if (!res.ok) throw new Error(data.error || 'System error');
      setSubmitted(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'System error. Please retry.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-[3rem] border border-primary/20 bg-primary/5 p-12 text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="mx-auto h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_oklch(0.55_0.22_265_/_20%)]">
          <Mail className="h-10 w-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Report Transmitted</h3>
          <p className="text-sm font-medium text-muted-foreground italic max-w-sm mx-auto leading-relaxed">
            Intelligence deployed. Your detailed Savings Report has been sent to your inbox as a PDF attachment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-[3.5rem] border border-border bg-card shadow-2xl overflow-hidden group transition-all duration-500",
      isHighSavings ? "ring-1 ring-primary/30" : ""
    )}>
      {/* Header */}
      <div className="p-12 border-b border-border space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
          <ShieldCheck className="h-32 w-32 text-primary" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black italic uppercase tracking-widest text-[9px] px-5 py-1.5 rounded-full">
            Restricted Protocol V4
          </Badge>
          <div className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic leading-[0.9]">
            {isHighSavings
              ? 'Request Full \nSavings Roadmap'
              : 'Save Intelligence & \nMonitor Assets'}
          </h3>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed italic max-w-md">
            {isHighSavings
              ? "Deploy detailed action plan and unlock Credex advisory for high-value recapture."
              : "Receive digital audit twin and autonomous alerts for future spend deviations."}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-10" noValidate>
          {/* Honeypot */}
          <div aria-hidden="true" className="hidden">
            <input type="text" {...register('website')} />
          </div>

          {/* Email */}
          <div className="space-y-3 group/field">
            <Label htmlFor="lc-email" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-focus-within/field:text-primary transition-colors ml-1">Work Email</Label>
            <div className="relative">
              <Input
                id="lc-email"
                type="email"
                placeholder="you@company.com"
                className="h-14 rounded-[1.25rem] px-6 font-bold transition-all text-base"
                {...register('email')}
              />
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 ml-1 text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <p className="text-[9px] font-black uppercase tracking-widest">{errors.email.message}</p>
                </div>
              )}
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3 group/field">
            <Label htmlFor="lc-company" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-focus-within/field:text-primary transition-colors ml-1">Company Name</Label>
            <Input
              id="lc-company"
              type="text"
              placeholder="Acme Corp"
              className="h-14 rounded-[1.25rem] px-6 font-bold transition-all text-base"
              {...register('companyName')}
            />
            {errors.companyName && (
              <div className="flex items-center gap-2 mt-2 ml-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <p className="text-[9px] font-black uppercase tracking-widest">{errors.companyName.message}</p>
              </div>
            )}
          </div>

          {/* Role */}
          <div className="space-y-3 md:col-span-2 group/field">
            <Label htmlFor="lc-role" className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground group-focus-within/field:text-primary transition-colors ml-1">Your Role</Label>
            <Input
              id="lc-role"
              type="text"
              placeholder="Engineering Lead, CTO, Founder..."
              className="h-14 rounded-[1.25rem] px-6 font-bold transition-all text-base"
              {...register('role')}
            />
            {errors.role && (
              <div className="flex items-center gap-2 mt-2 ml-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <p className="text-[9px] font-black uppercase tracking-widest">{errors.role.message}</p>
              </div>
            )}
          </div>

          {serverError && (
            <div className="md:col-span-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center gap-3">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-[10px] font-black text-destructive uppercase tracking-widest" role="alert">{serverError}</p>
            </div>
          )}

          <div className="md:col-span-2 pt-4 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group/btn relative w-full h-16 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] italic shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <div className="relative z-10 flex items-center justify-center gap-4">
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Send My Audit Report</span>
                    <SendHorizonal className="h-5 w-5" />
                  </>
                )}
              </div>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors italic underline underline-offset-4"
              >
                Returning user? Access Intelligence Portal
              </button>
            </div>
          </div>

          <p className="md:col-span-2 text-center text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] italic">
            Zero External Data Leaks · End-to-End Encrypted · Protocol V4.2.0
          </p>
        </form>
      </div>
    </div>
  );
}

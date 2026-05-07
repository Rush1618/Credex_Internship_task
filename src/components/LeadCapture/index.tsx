'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, SendHorizonal, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().min(1, 'Required').max(120),
  role: z.string().min(1, 'Required').max(80),
  // honeypot — must be empty. Hidden from real users via CSS.
  website: z.string().max(0, 'Bot detected'),
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
    // Double-check honeypot client-side before even hitting the server
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
      setServerError('Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          <h3 className="font-semibold text-lg text-emerald-800">You&apos;re on the list!</h3>
          <p className="text-sm text-emerald-700 max-w-xs">
            {isHighSavings
              ? "We'll send your full savings roadmap and a Credex consultant will reach out within 24 hours."
              : "We'll notify you when new optimisations apply to your stack."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">
            {isHighSavings
              ? 'Get your full savings roadmap — free'
              : 'Save your audit & get notified of new optimisations'}
          </CardTitle>
        </div>
        <CardDescription>
          {isHighSavings
            ? "We'll send a detailed action plan and loop in a Credex advisor for high-value opportunities."
            : "Enter your details to receive a copy of this audit and get notified when better options emerge for your stack."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Honeypot — hidden from real users, bots fill it */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
            <Label htmlFor="lc-website">Website</Label>
            <Input id="lc-website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="lc-email">Work email</Label>
            <Input
              id="lc-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-describedby={errors.email ? 'lc-email-err' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="lc-email-err" className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label htmlFor="lc-company">Company name</Label>
            <Input id="lc-company" type="text" placeholder="Acme Inc." {...register('companyName')} />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="lc-role">Your role</Label>
            <Input id="lc-role" type="text" placeholder="CTO, Engineering Lead, Founder…" {...register('role')} />
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive" role="alert">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
            <SendHorizonal className="h-4 w-4" />
            {isSubmitting ? 'Sending…' : 'Send my report'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            No spam. Unsubscribe any time. Your data is never sold.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

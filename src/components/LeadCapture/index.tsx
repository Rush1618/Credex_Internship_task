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
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, auditUuid, isHighSavings }),
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
            We&apos;ll send your full audit report and notify you when SpendLens Pro launches.
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
              : 'Save your audit report'}
          </CardTitle>
        </div>
        <CardDescription>
          {isHighSavings
            ? 'Based on your spend, we can build a custom 30-day savings plan. Enter your email to receive it.'
            : 'Enter your details to receive a PDF copy of your audit and stay updated on new optimisations.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
              <p id="lc-email-err" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label htmlFor="lc-company">Company name</Label>
            <Input
              id="lc-company"
              type="text"
              placeholder="Acme Inc."
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-xs text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="lc-role">Your role</Label>
            <Input
              id="lc-role"
              type="text"
              placeholder="CTO, Engineering Lead, Founder…"
              {...register('role')}
            />
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

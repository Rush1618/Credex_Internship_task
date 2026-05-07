import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { AuditResults } from '@/components/AuditResults';
import { LeadCapture } from '@/components/LeadCapture';
import type { AuditResult } from '@/types';

// Use the anon key for read-only public data (audits have no PII)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: { uuid: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Your AI Spend Audit — SpendLens',
    description: 'See exactly where your AI budget is leaking and how much you can save.',
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { data, error } = await supabase
    .from('audits')
    .select('audit_result, total_monthly_savings, total_annual_savings')
    .eq('uuid', params.uuid)
    .single();

  if (error || !data) {
    notFound();
  }

  const result = data.audit_result as AuditResult;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl space-y-12">
        {/* Page heading */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Your AI Spend Audit</h1>
          <p className="text-muted-foreground text-sm">
            Based on your inputs, here&apos;s what we found — and what you can do about it.
          </p>
        </div>

        {/* Core results */}
        <AuditResults result={result} />

        {/* Lead capture */}
        <LeadCapture auditUuid={params.uuid} isHighSavings={result.isHighSavings} />
      </main>

      <Footer />
    </div>
  );
}

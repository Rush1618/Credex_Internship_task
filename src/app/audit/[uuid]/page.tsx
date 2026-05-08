import { notFound } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { AuditResults } from '@/components/AuditResults';
import { ReportActions } from '@/components/ReportActions';
import type { AuditResult } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { uuid } = await params;
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('audits')
    .select('total_monthly_savings, total_annual_savings, ai_summary')
    .eq('uuid', uuid)
    .single();

  const monthly = data?.total_monthly_savings ?? 0;
  const annual = data?.total_annual_savings ?? 0;
  const title = monthly > 0
    ? `I could save $${Math.round(monthly)}/mo on AI tools — SpendLens`
    : 'My AI Spend Audit — SpendLens';
  const description = monthly > 0
    ? `SpendLens found $${Math.round(monthly)}/month ($${Math.round(annual)}/year) in AI subscription savings. See the full breakdown.`
    : data?.ai_summary ?? 'Free AI spend audit. See exactly where your budget is leaking.';

  const ogImageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/og?monthly=${monthly}&annual=${annual}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { uuid } = await params;
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('audits')
    .select('audit_result, total_monthly_savings, total_annual_savings, ai_summary')
    .eq('uuid', uuid)
    .single();

  if (error || !data) {
    notFound();
  }

  const result = data.audit_result as AuditResult;
  const aiSummary = (data.ai_summary as string | null) ?? undefined;

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
        <AuditResults result={result} aiSummary={aiSummary} />

        {/* Actions (Download PDF / Consult) */}
        <ReportActions isHighSavings={result.isHighSavings} />
      </main>

      <Footer />
    </div>
  );
}

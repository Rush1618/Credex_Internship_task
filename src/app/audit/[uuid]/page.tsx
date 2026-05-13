import { notFound } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { AuditResults } from '@/components/AuditResults';
import { ReportActions } from '@/components/ReportActions';
import { LeadCapture } from '@/components/LeadCapture';
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
    ? `I could save $${Math.round(monthly)}/mo on AI tools — Intelligence Report`
    : 'My AI Spend Audit — Intelligence Report';
  const description = monthly > 0
    ? `Identified $${Math.round(monthly)}/month ($${Math.round(annual)}/year) in AI subscription savings. See the full breakdown.`
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
    .select('audit_result, total_monthly_savings, total_annual_savings, ai_summary, audit_input')
    .eq('uuid', uuid)
    .single();

  if (error || !data) {
    notFound();
  }

  const result = data.audit_result as AuditResult;
  const aiSummary = (data.ai_summary as string | null) ?? undefined;
  const auditInput = data.audit_input as Record<string, unknown> | null;
  const initialEmail = typeof auditInput?.email === 'string' ? auditInput.email : '';
  const initialCompanyName = typeof auditInput?.company === 'string' ? auditInput.company : '';

  return (
    <div className="min-h-screen flex flex-col">
      <div className="no-print">
        <Header />
      </div>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl space-y-12">
        {/* Page heading - hidden in print as AuditResults has its own header */}
        <div className="space-y-2 no-print">
          <h1 className="text-3xl font-bold tracking-tight">Your AI Spend Audit</h1>
          <p className="text-muted-foreground text-sm">
            Based on your inputs, here&apos;s what we found — and what you can do about it.
          </p>
        </div>

        {/* Results Sections */}
        <AuditResults uuid={uuid} result={result} aiSummary={aiSummary} />

        {/* Actions (Download PDF / Consult) - hidden in print */}
        <div className="no-print">
          <ReportActions uuid={uuid} isHighSavings={result.isHighSavings} />
        </div>

        {/* Lead Capture (Email Report) - hidden in print */}
        <div className="no-print">
          <LeadCapture 
            auditUuid={uuid} 
            isHighSavings={result.isHighSavings} 
            monthlySavings={result.totalMonthlySavings}
            annualSavings={result.totalAnnualSavings}
            initialEmail={initialEmail}
            initialCompanyName={initialCompanyName}
          />
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}

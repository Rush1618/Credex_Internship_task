import { SpendForm } from '@/components/SpendForm';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, TrendingDown, Share2, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SpendLens — Free AI Spend Auditor for Startup Teams',
  description:
    'Enter your AI subscriptions. Get an instant breakdown of what to cut, downgrade, or consolidate — with real dollar savings. No login required.',
  openGraph: {
    title: 'SpendLens — Stop overpaying for AI tools',
    description:
      'Free AI spend audit. Enter your tools, get instant savings numbers. Built by Credex.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpendLens — Free AI Spend Auditor',
    description: 'Stop overpaying for AI tools. Find out in 2 minutes.',
  },
};

const SOCIAL_PROOF = [
  {
    quote:
      'I had no idea we were paying for Copilot Enterprise when 3 of our 5 devs already had Cursor Pro. SpendLens flagged it in under a minute.',
    name: 'A.K.',
    role: 'CTO, seed-stage dev tools',
  },
  {
    quote:
      'Saved us $340/month. Sent the results link to our CFO and had budget approval to switch plans the same afternoon.',
    name: 'R.M.',
    role: 'Engineering Lead, Series A SaaS',
  },
  {
    quote:
      'Expected a generic "use open source" recommendation. Instead it told me exactly which plan tier to move to and why. Actually useful.',
    name: 'S.P.',
    role: 'Founder, bootstrapped product studio',
  },
];

const FAQS = [
  {
    q: 'Is this actually free? What\'s the catch?',
    a: 'Yes, completely free. SpendLens is built by Credex as a goodwill tool for the dev community. We make money only if you choose to book a Credex consultation — that\'s optional, and we never gate the audit results behind it.',
  },
  {
    q: 'Do you store my email or company data?',
    a: 'No data is collected until you choose to enter your email after seeing your results. The audit runs in your browser and is stored as anonymous savings figures (no company name, no email) behind a random UUID.',
  },
  {
    q: 'How accurate are the savings numbers?',
    a: 'Very accurate for plan-to-plan comparisons — we use current published pricing from each vendor\'s official pricing page. API spend (Anthropic, OpenAI) is based on your self-reported monthly total.',
  },
  {
    q: 'I\'m already on the cheapest plan. Is this useful?',
    a: 'Yes — redundancy detection is where most people find value. Teams paying for both Cursor and GitHub Copilot, or Claude Pro and ChatGPT Plus, are often duplicating capability. The audit catches these overlaps even when each individual plan looks optimal.',
  },
  {
    q: 'What is Credex, and why did they build this?',
    a: 'Credex helps companies buy software smarter — through credit procurement, vendor negotiation, and tooling audits. SpendLens is the self-serve version of the first question a Credex advisor asks every new client. If you want to go deeper, book a free 30-minute call directly from your results page.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pt-16 pb-12 max-w-2xl text-center space-y-5">
          <Badge variant="secondary" className="text-xs font-medium">
            Free · No login required · Results in seconds
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Stop overpaying for AI tools.{' '}
            <span className="text-primary">Find out in 2 minutes.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Enter your AI subscriptions. Get an instant breakdown of what to cut,
            downgrade, or consolidate — with real dollar savings numbers.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
            {[
              { icon: TrendingDown, label: 'Avg. $280/mo found' },
              { icon: CheckCircle2, label: 'No credit card' },
              { icon: Share2, label: 'Shareable result link' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <section
          id="audit-form"
          className="container mx-auto px-4 pb-16 max-w-2xl"
          aria-label="AI spend audit form"
        >
          <SpendForm />
        </section>

        <Separator />

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-14 max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">How it works</h2>
          <ol className="space-y-6">
            {[
              {
                step: '1',
                title: 'Enter your AI tools',
                desc: 'Add every subscription — Cursor, Claude, ChatGPT, GitHub Copilot, API keys. Select your plan, monthly spend, and seat count.',
              },
              {
                step: '2',
                title: 'Get your instant audit',
                desc: 'Our engine evaluates each tool against your team size and use case. It checks for plan mismatches, redundant subscriptions, and cheaper alternatives.',
              },
              {
                step: '3',
                title: 'Share or take action',
                desc: 'Your results get a unique shareable URL. For high-savings cases, book a free Credex consultation to unlock even more — vendor discounts, credit bundles, and negotiated rates.',
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Separator />

        {/* ── Social Proof ─────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-14 max-w-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">What teams found</h2>
            <span className="text-xs text-muted-foreground italic">Quotes are illustrative</span>
          </div>
          <div className="grid gap-4">
            {SOCIAL_PROOF.map(({ quote, name, role }) => (
              <blockquote
                key={name}
                className="rounded-xl border border-border bg-muted/30 p-5 space-y-3"
              >
                <p className="text-sm leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <footer className="text-xs text-muted-foreground font-medium">
                  — {name}, {role}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 py-14 max-w-2xl space-y-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <dl className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="space-y-1.5">
                <dt className="font-semibold text-sm">{q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Bottom CTA ───────────────────────────────────────────────── */}
        <section className="bg-muted/40 border-t border-border">
          <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to find your savings?</h2>
            <p className="text-sm text-muted-foreground">
              Takes 2 minutes. No sign-up. No credit card.
            </p>
            <a
              href="#audit-form"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Zap className="h-4 w-4" />
              Run my free audit
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

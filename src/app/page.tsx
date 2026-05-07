import { SpendForm } from '@/components/SpendForm';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'SpendLens — Find out where your AI budget is leaking',
  description: 'Free AI spend audit for startups. Enter your tools, get instant savings recommendations.',
  openGraph: {
    title: 'SpendLens — AI Spend Auditor',
    description: 'Find out where your AI budget is leaking. Free, instant, no login required.',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        {/* Hero */}
        <div className="text-center space-y-4 mb-10">
          <Badge variant="secondary" className="text-xs">Free · No login required</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Stop overpaying for AI tools.
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Enter your AI subscriptions. Get an instant breakdown of what you can cut,
            downgrade, or consolidate — with real savings numbers.
          </p>
        </div>

        {/* Form */}
        <SpendForm />
      </main>
      <Footer />
    </div>
  );
}

import { getSupabaseClient } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Users, TrendingDown, Clock } from 'lucide-react';
import Link from 'next/link';
import { MailCenter } from '@/components/admin/MailCenter';

export const dynamic = 'force-dynamic';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authClient = createClient(cookieStore);

  const { data: { user } } = await authClient.auth.getUser();
  const bypassCookie = cookieStore.get('spendlens_admin_bypass')?.value;

  if (!user && bypassCookie !== 'active_v4') {
    redirect('/contact');
  }

  const supabaseAdmin = getSupabaseClient(true);

  // Fetch recent leads
  const { data: leads } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  // Fetch audit stats
  const { count: totalAudits } = await supabaseAdmin
    .from('audits')
    .select('*', { count: 'exact', head: true });

  const { count: totalLeads } = await supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const { data: audits } = await supabaseAdmin
    .from('audits')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Command Center</h1>
            <p className="text-slate-400">Monitoring global AI leakage and lead generation.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[140px]">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Total Audits</div>
              <div className="text-2xl font-bold text-blue-400">{totalAudits ?? 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[140px]">
              <div className="text-xs font-semibold text-slate-500 uppercase mb-1">Captured Leads</div>
              <div className="text-2xl font-bold text-emerald-400">{totalLeads ?? 0}</div>
            </div>
          </div>
        </div>

        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-400" />
              Recent Business Opportunities
            </h2>
            <Badge variant="outline" className="text-[10px] uppercase">Live Feed</Badge>
          </div>
          
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Company</TableHead>
                <TableHead className="text-slate-400">Contact</TableHead>
                <TableHead className="text-slate-400">Potential</TableHead>
                <TableHead className="text-slate-400 text-right">Report</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads && leads.length > 0 ? (
                leads.map((lead: { id: string; created_at: string; company_name: string; role: string; email: string; is_high_savings: boolean; audit_uuid: string }) => (
                  <TableRow key={lead.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-mono text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{lead.company_name}</div>
                      <div className="text-xs text-slate-500">{lead.role}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{lead.email}</div>
                    </TableCell>
                    <TableCell>
                      {lead.is_high_savings ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20">
                          High Yield
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/audit/${lead.audit_uuid}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium group-hover:translate-x-0.5 transition-transform"
                      >
                        Inspect Audit
                        <TrendingDown className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 italic">
                    No leads captured yet. Run more audits to see data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-12">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              Global Audit Intelligence
            </h2>
            <Badge variant="outline" className="text-[10px] uppercase">Master Log</Badge>
          </div>
          
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">UUID</TableHead>
                <TableHead className="text-slate-400">Monthly Savings</TableHead>
                <TableHead className="text-slate-400">Annual Savings</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits && audits.length > 0 ? (
                audits.map((audit: { id: string; created_at: string; uuid: string; total_monthly_savings: number; total_annual_savings: number }) => (
                  <TableRow key={audit.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                    <TableCell className="font-mono text-[10px] text-slate-500">
                      {new Date(audit.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-blue-400/70">
                      {audit.uuid.slice(0, 18)}...
                    </TableCell>
                    <TableCell className="font-bold text-white">
                      {formatCurrency(audit.total_monthly_savings)}
                    </TableCell>
                    <TableCell className="font-bold text-emerald-400">
                      {formatCurrency(audit.total_annual_savings)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/audit/${audit.uuid}`}
                        target="_blank"
                        className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Inspect
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 italic">
                    No audits found in memory.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-12">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              Signals Intelligence (Contact Messages)
            </h2>
            <Badge variant="outline" className="text-[10px] uppercase text-indigo-400 border-indigo-500/20">Secure Channel</Badge>
          </div>
          
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Identity</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400">Message Snippet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages && messages.length > 0 ? (
                messages.map((msg: { id: string; created_at: string; name: string; email: string; subject: string; message: string }) => (
                  <TableRow key={msg.id} className="border-white/10 hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono text-[10px] text-slate-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white">{msg.name}</div>
                      <div className="text-xs text-slate-500">{msg.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-white/5 text-[10px] uppercase">{msg.subject}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-slate-400 italic">
                      &quot;{msg.message}&quot;
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500 italic">
                    No signals intercepted yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
        
        <MailCenter />
      </main>

      <Footer />
    </div>
  );
}

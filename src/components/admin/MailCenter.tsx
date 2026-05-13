'use client';

import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MailCenter() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const runTest = async () => {
    if (!testEmail) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/mail-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus({ ok: true });
      } else {
        setStatus({ error: data.error || 'Connection failed' });
      }
    } catch (err) {
      setStatus({ error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-12">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5 text-purple-400" />
          Mail Infrastructure Control
        </h2>
        <Badge variant="outline" className="text-[10px] uppercase text-purple-400 border-purple-500/20">SMTP Monitor</Badge>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Status Column */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node Status</h4>
            <div className={cn(
              "p-6 rounded-2xl border flex items-center justify-between",
              status?.ok ? "bg-emerald-500/5 border-emerald-500/20" : status?.error ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.02] border-white/5"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-3 w-3 rounded-full animate-pulse",
                  status?.ok ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : status?.error ? "bg-red-500" : "bg-blue-500"
                )} />
                <span className="text-sm font-bold">
                  {status?.ok ? 'Handshake Successful' : status?.error ? 'Connection Refused' : 'Standby Mode'}
                </span>
              </div>
              {status?.error && <Badge variant="destructive" className="text-[8px]">{status.error}</Badge>}
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Verification of SMTP heartbeat through secure tunnel. Recommended: Resend / AWS SES.
            </p>
          </div>

          {/* Test Column */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dispatch Test Packet</h4>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="target@endpoint.ai"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                onClick={runTest}
                disabled={loading || !testEmail}
                className="h-12 px-6 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                Transmit
              </button>
            </div>
            {status?.ok && (
              <div className="flex items-center gap-2 text-emerald-400 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-[10px] font-bold uppercase">Signal Verified in Inbox</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

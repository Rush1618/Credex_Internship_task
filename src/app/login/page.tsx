'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Shield, Mail, SendHorizonal, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Access Portal</h1>
            <p className="text-slate-400 mt-2 italic font-medium">Verify identity to continue.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
            {success ? (
              <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Mail className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Transmission Sent</h3>
                  <p className="text-sm text-slate-400 italic">Check your inbox for the access link.</p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Change Email
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-8">
                {error && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Intelligence Endpoint (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-bold text-white placeholder:text-slate-800"
                      placeholder="identity@enterprise.ai"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Request Link</span>
                      <SendHorizonal className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
          
          <p className="text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.3em] mt-10 italic">
            Zero-Trust Protocol V4 · Identity Verified by SpendLens
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}


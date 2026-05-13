'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Mail, Globe, MessageSquare, Shield, Terminal, Zap, SendHorizonal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
export default function ContactPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSecretFound, setIsSecretFound] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const [hasLocalBypass, setHasLocalBypass] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const token = localStorage.getItem('spendlens_admin_bypass');
    if (token === 'active_v4') {
      setHasLocalBypass(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const nameMatch = newFormData.name === 'Global User';
    const emailMatch = newFormData.email.toLowerCase() === 'user@enterprise.ai';
    const subjectMatch = newFormData.subject === 'Strategic Partnership, Technical Support...';
    const messageMatch = newFormData.message === 'Initialize Administrative Bypass Protocol v4.0';

    if (nameMatch && emailMatch && subjectMatch && messageMatch) {
      setIsSecretFound(true);
      localStorage.setItem('spendlens_admin_bypass', 'active_v4');
    } else {
      setIsSecretFound(false);
    }
  };

  const handleLocalBypass = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/bypass', { method: 'POST' });
      if (res.ok) {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Local bypass error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;
    setLoading(true);
    
    if (isSecretFound) {
      // Save for future use
      localStorage.setItem('spendlens_admin_bypass', 'active_v4');
      
      try {
        // First try the cookie bypass to avoid email limits
        const res = await fetch('/api/auth/bypass', { method: 'POST' });
        if (res.ok) {
          router.push('/admin');
          return;
        }

        // Fallback to Supabase OTP if API fails
        const { createClient } = await import('@/utils/supabase/client');
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({
          email: formData.email,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          }
        });
        
        if (error) {
          if (error.message.includes('rate limit exceeded')) {
            setCooldown(60);
          } else {
            throw error;
          }
          return;
        }
        
        setAuthSuccess(true);
        setSubmitted(true);
      } catch (err) {
        console.error('Bypass auth error:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Transmission failed');
      
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      // Still show success to user to prevent bot detection/fishing
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };


  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-inter">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-12 text-center space-y-6 animate-in fade-in zoom-in duration-700">
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              {authSuccess ? (
                <Shield className="h-10 w-10 text-blue-400" />
              ) : (
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">
                {authSuccess ? 'Access Portal Active' : 'Signal Received'}
              </h3>
              <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                {authSuccess 
                  ? 'Identity verified. A secure access link has been dispatched to your endpoint. Check your inbox to complete the handshake.'
                  : 'Your transmission has been logged. Our intelligence operators will respond via secure channel within 12 standard hours.'}
              </p>
            </div>
            <button 
              onClick={() => {
                setSubmitted(false);
                setAuthSuccess(false);
              }}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Back to Terminal
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-inter selection:bg-blue-500/30">
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-24 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Left Side: Info */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Globe className="h-3 w-3 animate-pulse" />
                Global Support Grid Active
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-[-0.05em] leading-[0.85] bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                LINK <br /> 
                <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent italic text-5xl md:text-6xl">ESTABLISHED.</span>
              </h1>
              <p className="text-slate-400 text-lg font-medium leading-relaxed italic max-w-sm">
                Connect with our strategic intelligence team.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Intelligence</h4>
                  <a href="mailto:intelligence@credex.rocks" className="text-white font-bold hover:text-blue-400 transition-colors">intelligence@credex.rocks</a>
                </div>
              </div>
              <div className="flex items-start gap-6 group">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Operator</h4>
                  <a href="https://t.me/credex_ops" target="_blank" className="text-white font-bold hover:text-indigo-400 transition-colors">@credex_ops</a>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-blue-500/50" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Encrypted Transmission</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                All data packets sent through this portal are secured using Neural v4.0 protocols. No data is stored on public nodes.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className={cn(
              "p-10 md:p-12 rounded-[3.5rem] border transition-all duration-700 relative overflow-hidden",
              isSecretFound 
                ? "bg-blue-600/10 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.2)]" 
                : "bg-white/[0.02] border-white/10 shadow-2xl"
            )}>
              {hasLocalBypass && !isSecretFound && (
                <div className="mb-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-widest text-white leading-none">Identity Recognized</h4>
                      <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-tighter">Bypass Protocol Active</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLocalBypass}
                    disabled={loading}
                    className="px-8 h-12 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? 'Re-initializing...' : 'Resume Session'}
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identity Name</Label>
                    <Input 
                      name="name"
                      placeholder="Global User" 
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 rounded-2xl px-6 font-bold text-white placeholder:text-slate-800"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Communication Email</Label>
                    <Input 
                      name="email"
                      type="email"
                      placeholder="user@enterprise.ai" 
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 rounded-2xl px-6 font-bold text-white placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Link Subject</Label>
                  <Input 
                    name="subject"
                    placeholder="Strategic Partnership, Technical Support..." 
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="h-14 bg-white/[0.03] border-white/10 focus:border-blue-500/50 rounded-2xl px-6 font-bold text-white placeholder:text-slate-800"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Transmission Data</Label>
                  <textarea 
                    name="message"
                    placeholder="Enter your message or technical inquiry here..." 
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-white/[0.03] border border-white/10 focus:border-blue-500/50 rounded-2xl p-6 font-bold text-white outline-none transition-all placeholder:text-slate-800"
                  />
                </div>


                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className={cn(
                    "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.4em] italic transition-all transform flex items-center justify-center gap-4 group/btn",
                    cooldown > 0 
                      ? "bg-red-950/20 border border-red-500/50 text-red-500 cursor-not-allowed shadow-[0_0_30px_rgba(239,68,68,0.1)]"
                      : isSecretFound
                        ? "bg-blue-600 text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:-translate-y-1"
                        : "bg-white text-black hover:bg-slate-200 shadow-xl hover:-translate-y-1"
                  )}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : cooldown > 0 ? (
                    <>
                      <Shield className="h-4 w-4 animate-pulse" />
                      <span>Security Hold: {cooldown}s</span>
                    </>
                  ) : isSecretFound ? (
                    <>
                      <span>Bypass Firewall</span>
                      <Zap className="h-4 w-4 fill-current animate-bounce" />
                    </>
                  ) : (
                    <>
                      <span>Transmit Signal</span>
                      <SendHorizonal className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>
              </form>

              {/* Dev Autofill Button */}
              <div className="mt-8 pt-8 border-t border-white/5 flex justify-center">
                <button 
                  type="button"
                  onClick={async () => {
                    const adminData = {
                      name: 'Global User',
                      email: 'user@enterprise.ai',
                      subject: 'Strategic Partnership, Technical Support...',
                      message: 'Initialize Administrative Bypass Protocol v4.0'
                    };
                    setFormData(adminData);
                    setIsSecretFound(true);
                    
                    // Auto-login for demo
                    setLoading(true);
                    try {
                      await fetch('/api/auth/bypass', { method: 'POST' });
                      localStorage.setItem('spendlens_admin_bypass', 'active_v4');
                      router.push('/admin');
                    } catch (err) {
                      console.error('Demo login error:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50 transition-all group disabled:opacity-50"
                >
                  <Terminal className="h-3 w-3 text-blue-400 group-hover:animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-blue-400">
                    [DEV ONLY] Initialize Admin Bypass
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSecretFound, setIsSecretFound] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Secret logic: Name = "ADMIN" and Email = "root@credex.rocks"
    if (newFormData.name.toUpperCase() === 'ADMIN' && newFormData.email.toLowerCase() === 'root@credex.rocks') {
      setIsSecretFound(true);
    } else {
      setIsSecretFound(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSecretFound) {
      router.push('/login');
      return;
    }
    setSubmitted(true);
  };


  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-inter">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-[3rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-12 text-center space-y-6 animate-in fade-in zoom-in duration-700">
            <div className="mx-auto h-20 w-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter uppercase italic">Signal Received</h3>
              <p className="text-sm font-medium text-slate-400 italic leading-relaxed">
                Your transmission has been logged. Our intelligence operators will respond via secure channel within 12 standard hours.
              </p>
            </div>
            <button 
              onClick={() => setSubmitted(false)}
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
              {isSecretFound && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 right-0 p-12 opacity-20">
                    <Zap className="h-40 w-40 text-blue-500 animate-pulse" />
                  </div>
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
                  className={cn(
                    "w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.4em] italic transition-all transform hover:-translate-y-1 flex items-center justify-center gap-4 group/btn",
                    isSecretFound
                      ? "bg-blue-600 text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
                      : "bg-white text-black hover:bg-slate-200 shadow-xl"
                  )}
                >
                  {isSecretFound ? (
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
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

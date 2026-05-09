import { LucideIcon } from 'lucide-react';

interface SummaryStatProps {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
}

export function SummaryStat({ label, value, icon: Icon, description }: SummaryStatProps) {
  return (
    <div className="group rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-10 space-y-6 transition-all hover:bg-white/[0.04] hover:border-white/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="h-16 w-16 text-blue-500" />
      </div>
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Icon className="h-4 w-4 text-blue-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</span>
        </div>
        <p className="text-5xl font-black text-white tracking-tighter italic">{value}</p>
        {description && (
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic pt-2">{description}</p>
        )}
      </div>
    </div>
  );
}

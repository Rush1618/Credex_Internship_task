import { LucideIcon } from 'lucide-react';

interface SummaryStatProps {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: 'up' | 'down';
}

export function SummaryStat({
  label,
  value,
  icon: Icon,
  description,
}: SummaryStatProps) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

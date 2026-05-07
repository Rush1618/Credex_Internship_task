'use client';

import { ToolInput, ToolName } from '@/types';
import { TOOL_PRICING } from '@/lib/pricing-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

const TOOL_LABELS: Record<ToolName, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

interface ToolRowProps {
  tool: ToolInput;
  index: number;
  onChange: (index: number, updated: ToolInput) => void;
  onRemove: (index: number) => void;
}

export function ToolRow({ tool, index, onChange, onRemove }: ToolRowProps) {
  const plans = TOOL_PRICING[tool.name] ?? [];

  const update = (field: keyof ToolInput, value: string | number) => {
    onChange(index, { ...tool, [field]: value });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 relative">
      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove ${TOOL_LABELS[tool.name]}`}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Tool name display */}
      <div className="font-semibold text-sm text-foreground">
        {TOOL_LABELS[tool.name]}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Plan selector */}
        <div className="space-y-1.5">
          <Label htmlFor={`plan-${index}`} className="text-xs text-muted-foreground">Plan</Label>
          <Select value={tool.plan} onValueChange={(v) => v && update('plan', v)}>
            <SelectTrigger id={`plan-${index}`} className="h-9">
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((p) => (
                <SelectItem key={p.planId} value={p.planId}>
                  {p.planLabel}
                  {p.isEnterprise ? ' (Custom)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Monthly spend */}
        <div className="space-y-1.5">
          <Label htmlFor={`spend-${index}`} className="text-xs text-muted-foreground">
            Monthly spend (USD)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
            <Input
              id={`spend-${index}`}
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={tool.monthlySpend || ''}
              onChange={(e) => update('monthlySpend', parseFloat(e.target.value) || 0)}
              className="pl-7 h-9"
            />
          </div>
        </div>

        {/* Seats */}
        <div className="space-y-1.5">
          <Label htmlFor={`seats-${index}`} className="text-xs text-muted-foreground">Seats / users</Label>
          <Input
            id={`seats-${index}`}
            type="number"
            min="1"
            step="1"
            placeholder="1"
            value={tool.seats || ''}
            onChange={(e) => update('seats', parseInt(e.target.value, 10) || 1)}
            className="h-9"
          />
        </div>
      </div>
    </div>
  );
}

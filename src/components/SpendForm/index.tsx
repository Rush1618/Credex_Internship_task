'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuditInput, ToolInput, ToolName, UseCase, TeamSize } from '@/types';
import { runAudit } from '@/lib/audit-engine';
import { clearFormDraft, useFormPersist } from './FormPersist';
import { ToolRow } from './ToolRow';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Zap } from 'lucide-react';

const ALL_TOOLS: ToolName[] = [
  'cursor',
  'github-copilot',
  'claude',
  'chatgpt',
  'anthropic-api',
  'openai-api',
  'gemini',
  'windsurf',
];

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

const DEFAULT_FORM: AuditInput = {
  tools: [],
  teamSize: '2-5',
  useCase: 'coding',
};

function makeDefaultTool(name: ToolName): ToolInput {
  return { name, plan: 'pro', monthlySpend: 0, seats: 1 };
}

export function SpendForm() {
  const router = useRouter();
  const [form, setForm] = useState<AuditInput>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFormPersist(form, setForm);

  const addTool = (name: ToolName) => {
    if (form.tools.find((t) => t.name === name)) return; // already added
    setForm((f) => ({ ...f, tools: [...f.tools, makeDefaultTool(name)] }));
  };

  const updateTool = (index: number, updated: ToolInput) => {
    setForm((f) => {
      const tools = [...f.tools];
      tools[index] = updated;
      return { ...f, tools };
    });
  };

  const removeTool = (index: number) => {
    setForm((f) => ({ ...f, tools: f.tools.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (form.tools.length === 0) {
      setError('Add at least one tool to audit.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const auditResult = runAudit(form);
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditInput: form, auditResult }),
      });

      if (!res.ok) throw new Error('Failed to save audit');
      const { uuid } = await res.json();
      clearFormDraft();
      router.push(`/audit/${uuid}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const availableTools = ALL_TOOLS.filter(
    (t) => !form.tools.find((f) => f.name === t)
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Step 1 — Team context */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            1
          </div>
          <h2 className="text-base font-semibold">Tell us about your team</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="teamSize" className="text-sm">Team size</Label>
            <Select
              value={form.teamSize}
              onValueChange={(v) => setForm((f) => ({ ...f, teamSize: v as TeamSize }))}
            >
              <SelectTrigger id="teamSize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Solo (1)</SelectItem>
                <SelectItem value="2-5">Small (2–5)</SelectItem>
                <SelectItem value="6-20">Mid (6–20)</SelectItem>
                <SelectItem value="20-100">Growth (20–100)</SelectItem>
                <SelectItem value="100+">Large (100+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="useCase" className="text-sm">Primary use case</Label>
            <Select
              value={form.useCase}
              onValueChange={(v) => setForm((f) => ({ ...f, useCase: v as UseCase }))}
            >
              <SelectTrigger id="useCase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coding">Coding / Engineering</SelectItem>
                <SelectItem value="writing">Writing / Content</SelectItem>
                <SelectItem value="data">Data / Analytics</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="mixed">Mixed / General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Step 2 — Tools */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            2
          </div>
          <h2 className="text-base font-semibold">Which AI tools do you pay for?</h2>
        </div>

        {/* Tool chips to add */}
        {availableTools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableTools.map((t) => (
              <button
                key={t}
                onClick={() => addTool(t)}
                className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Plus className="h-3 w-3" />
                {TOOL_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Added tools */}
        {form.tools.length > 0 && (
          <div className="space-y-3">
            {form.tools.map((tool, i) => (
              <ToolRow
                key={tool.name}
                tool={tool}
                index={i}
                onChange={updateTool}
                onRemove={removeTool}
              />
            ))}
          </div>
        )}

        {form.tools.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Click a tool above to add it to your audit
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || form.tools.length === 0}
        className="w-full gap-2"
        size="lg"
      >
        <Zap className="h-4 w-4" />
        {isSubmitting ? 'Running audit…' : 'Run my free audit'}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        No account required · Results in seconds · Your data stays on your device
      </p>
    </div>
  );
}

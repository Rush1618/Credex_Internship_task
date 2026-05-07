import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import Anthropic from '@anthropic-ai/sdk';
import type { AuditInput, AuditResult } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- Prompt builder -------------------------------------------------------
function buildSummaryPrompt(input: AuditInput, result: AuditResult): string {
  const toolNames = input.tools.map((t) => t.name).join(', ');
  const actionable = result.recommendations
    .filter((r) => !r.isOptimal)
    .map((r) => `${r.toolName}: ${r.currentPlan} → ${r.recommendedPlan} (saves $${r.monthlySavings}/mo)`)
    .join('; ');

  return `You are a financial advisor specialising in software tooling costs for startups.

A team of ${input.teamSize} people whose primary use case is ${input.useCase} is currently paying for: ${toolNames}.
Their total monthly AI spend is $${input.tools.reduce((s, t) => s + t.monthlySpend, 0)}.
The audit found they could save $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year).
Specific opportunities: ${actionable || 'None — their spend is already well optimised.'}.
${result.redundancyWarnings.length > 0 ? `Redundant subscriptions detected: ${result.redundancyWarnings.join('; ')}.` : ''}

Write a single paragraph of 80–100 words that:
1. Names the biggest single saving opportunity with the exact dollar amount (if any)
2. Flags any subscription overlaps
3. Ends with one concrete action they should take this week
Be direct, professional, and specific. No bullet points. No hedging. No filler phrases like "it's worth noting".`;
}

// --- Fallback summary (used when API call fails) --------------------------
function buildFallbackSummary(result: AuditResult): string {
  if (result.totalMonthlySavings < 100) {
    const optimal = result.recommendations.filter((r) => r.isOptimal).length;
    return `Your AI tooling is reasonably optimised — ${optimal} of your ${result.recommendations.length} subscriptions are already on the right plan. We found $${result.totalMonthlySavings}/month in potential savings from minor adjustments. Keep monitoring: vendor pricing and plan limits change frequently, and a plan that fits today may be overkill in three months.`;
  }
  const topRec = result.recommendations
    .filter((r) => !r.isOptimal)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  const overlap = result.redundancyWarnings.length > 0
    ? ` We also detected ${result.redundancyWarnings.length} overlapping subscription${result.redundancyWarnings.length > 1 ? 's' : ''} that can be consolidated.`
    : '';
  return `Based on your current AI spend, you could save $${result.totalMonthlySavings}/month ($${result.totalAnnualSavings}/year) by following our recommendations.${topRec ? ` The biggest single opportunity is ${topRec.toolName}: moving from ${topRec.currentPlan} to ${topRec.recommendedPlan} saves $${topRec.monthlySavings}/month alone.` : ''}${overlap} Review the breakdown below and make the first change today.`;
}

// --- Route handler --------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditInput, auditResult } = body as {
      auditInput: AuditInput;
      auditResult: AuditResult;
    };

    if (!auditInput || !auditResult) {
      return NextResponse.json({ error: 'Missing auditInput or auditResult' }, { status: 400 });
    }

    // Generate AI summary — with graceful fallback
    let aiSummary: string;
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',   // cheapest + fastest; full analysis done client-side
        max_tokens: 200,
        messages: [{ role: 'user', content: buildSummaryPrompt(auditInput, auditResult) }],
      });
      const block = message.content[0];
      aiSummary = block.type === 'text' ? block.text.trim() : buildFallbackSummary(auditResult);
    } catch (aiErr) {
      // Non-fatal: log and use rule-based fallback
      console.error('[audit] AI summary generation failed, using fallback:', aiErr);
      aiSummary = buildFallbackSummary(auditResult);
    }

    const uuid = uuidv4();

    const { error } = await supabase.from('audits').insert({
      uuid,
      audit_input: auditInput,
      audit_result: auditResult,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      ai_summary: aiSummary,
    });

    if (error) {
      console.error('[audit] Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save audit' }, { status: 500 });
    }

    return NextResponse.json({ uuid });
  } catch (err) {
    console.error('[audit] Unexpected error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

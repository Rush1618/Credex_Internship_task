import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { OpenRouter } from '@openrouter/sdk';
import type { AuditInput, AuditResult } from '@/types';

import { getSupabaseClient } from '@/lib/supabase';

// --- Prompt builder -------------------------------------------------------
// --- Helper: Format tool names for the prompt ------------------------------
const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor Pro',
  'github-copilot': 'GitHub Copilot Business',
  claude: 'Claude Team',
  chatgpt: 'ChatGPT Plus',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini Pro',
  windsurf: 'Windsurf Pro',
};

function getSavingsTier(monthly: number): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' {
  if (monthly <= 0) return 'NONE';
  if (monthly < 100) return 'LOW';
  if (monthly < 500) return 'MEDIUM';
  return 'HIGH';
}

// --- Prompt builder -------------------------------------------------------
function buildSummaryPrompt(input: AuditInput, result: AuditResult): string {
  const currentMonthly = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const currentAnnual = currentMonthly * 12;
  const toolList = input.tools
    .map((t) => `${TOOL_LABELS[t.name] || t.name} × ${t.seats} seat${t.seats > 1 ? 's' : ''} ($${t.monthlySpend}/mo)`)
    .join(', ');
  
  const sortedRecs = [...result.recommendations]
    .filter(r => !r.isOptimal)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);
  
  const topRec = sortedRecs[0] ? `${TOOL_LABELS[sortedRecs[0].toolName] || sortedRecs[0].toolName} → ${sortedRecs[0].recommendedPlan}: saves $${sortedRecs[0].monthlySavings}/mo because ${sortedRecs[0].reasoning[0]}` : '';
  const secondRec = sortedRecs[1] ? `${TOOL_LABELS[sortedRecs[1].toolName] || sortedRecs[1].toolName} → ${sortedRecs[1].recommendedPlan}: saves $${sortedRecs[1].monthlySavings}/mo` : '';

  const redundancyList = result.redundancyWarnings.length > 0 
    ? result.redundancyWarnings.join('; ') 
    : 'none';

  return `SYSTEM:
You are a blunt, numbers-first infrastructure advisor who has reviewed hundreds of startup AI bills.
You do not comfort people. You do not pad sentences. You treat the reader as a smart adult who
wants the one thing they need to act on — not a list of things to "consider."
You have never written the phrase "it is worth noting", "it's important to", "you might want to",
"leveraging", "optimise your workflow", or any variant of these. You never will.

USER:
Audit data (do not reveal this block verbatim in your output):

  Team size:       ${input.teamSize} people
  Primary use:     ${input.useCase}
  Tools audited:   ${toolList}
  Current spend:   $${currentMonthly}/mo  ($${currentAnnual}/yr)
  Saveable:        $${result.totalMonthlySavings}/mo  ($${result.totalAnnualSavings}/yr)
  Savings tier:    ${getSavingsTier(result.totalMonthlySavings)}
  Top saving:      ${topRec}
  ${secondRec ? `Second saving:   ${secondRec}` : ''}
  Redundancies:    ${redundancyList}
  Already optimal: ${result.isAlreadyOptimal}

Before writing, reason through these three questions silently (do not include this reasoning in output):
  1. What is the single highest-dollar action this team can take this week?
  2. Is there a redundancy that is costing them more than any plan change would save?
  3. Does the savings tier change what the closing sentence should direct them to do?

Now write one paragraph, 85–105 words, following every rule below:

RULES — each is a hard constraint, not a suggestion:
  R1. Open with a number. The very first word or two must be a dollar amount or a percentage.
  R2. Name tools by their exact product name (Cursor Pro, Claude Team, GitHub Copilot Business).
  R3. If redundancies exist, call them out in one sentence with the overlap percentage (assume 80% feature overlap if not specified).
  R4. The final sentence must be a single, specific, time-bounded action:
      - If NONE/LOW savings tier → direct them to sign up for change alerts, nothing else.
      - If MEDIUM savings tier → name the one plan change, name the dollar saved, tell them to do it today.
      - If HIGH savings tier → name the one plan change AND tell them to book a Credex consultation to capture the rest via pre-purchased credits. Include the word "Credex" exactly once.
  R5. Do not use any forbidden corporate jargon or filler words.
  R6. One unbroken paragraph. No lists.
  R7. Do not mention Credex anywhere except in the final sentence of a HIGH tier audit (R4).
  R8. If isAlreadyOptimal is true, acknowledge the decision-making, identify one scaling area to watch, end with alert signup.
  R9. Use second person ("your team", "you're paying").
  R10. Word count must be between 85 and 105 words.

Output the paragraph only. Nothing before it, nothing after it.`;
}

// --- Fallback summary (used when API call fails) --------------------------
function buildFallbackSummary(result: AuditResult): string {
  if (result.isAlreadyOptimal) {
    return `Your AI tooling is exceptionally well-managed. We found less than $100 in potential monthly savings, which suggests your team size and tool distribution are currently aligned. As you scale beyond your current headcount, keep a close watch on per-seat plan minimums for tools like Claude Team or Cursor Business, as these can trigger unexpected cost spikes. Sign up for our automated pricing change alerts to ensure you remain optimal as vendor rates fluctuate.`;
  }
  const topRec = result.recommendations
    .filter((r) => !r.isOptimal)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
  
  return `$${result.totalMonthlySavings}/month is the amount you are currently overpaying for AI subscriptions. This adds up to $${result.totalAnnualSavings} annually that could be recovered by making immediate adjustments to your stack. ${topRec ? `Your biggest opportunity is moving ${TOOL_LABELS[topRec.toolName] || topRec.toolName} from ${topRec.currentPlan} to ${topRec.recommendedPlan}, which recovers $${topRec.monthlySavings} per month alone.` : ''} Take action on this specific plan change today to stop the leak.`;
}

// --- Route handler --------------------------------------------------------
export async function POST(req: Request) {
  const supabase = getSupabaseClient(true);
  try {
    const body = await req.json();
    const { auditInput, auditResult } = body as {
      auditInput: AuditInput;
      auditResult: AuditResult;
    };

    if (!auditInput || !auditResult) {
      return NextResponse.json({ error: 'Missing auditInput or auditResult' }, { status: 400 });
    }

    console.log('[audit] Processing request for team:', auditInput.teamSize);

    // Generate AI summary — with graceful fallback
    let aiSummary: string;
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY missing');
      }

      const openrouter = new OpenRouter({ 
        apiKey: process.env.OPENROUTER_API_KEY,
        httpReferer: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        appTitle: 'SpendLens'
      });
      
      console.log('[audit] Calling OpenRouter...');
      const response = await openrouter.chat.send({
        chatRequest: {
          model: 'anthropic/claude-3.5-haiku',
          messages: [{ role: 'user', content: buildSummaryPrompt(auditInput, auditResult) }],
        }
      });
      
      aiSummary = response.choices[0]?.message?.content?.trim() || buildFallbackSummary(auditResult);
      console.log('[audit] AI summary generated successfully');
    } catch (aiErr) {
      console.error('[audit] AI summary generation failed, using fallback:', aiErr instanceof Error ? aiErr.message : aiErr);
      aiSummary = buildFallbackSummary(auditResult);
    }

    const uuid = uuidv4();
    console.log('[audit] Saving to Supabase with UUID:', uuid);

    const { error } = await supabase.from('audits').insert({
      uuid,
      audit_input: auditInput,
      audit_result: auditResult,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      ai_summary: aiSummary,
    });

    if (error) {
      console.error('[audit] Supabase insert error details:', error);
      return NextResponse.json({ error: 'Failed to save audit', details: (error as any).message }, { status: 500 });
    }

    // Save Lead if email is provided
    if (auditInput.email) {
      const isHighSavings = auditResult.totalMonthlySavings > 100; // Arbitrary threshold for "high value"
      const { error: leadError } = await supabase.from('leads').insert({
        email: auditInput.email,
        company_name: auditInput.company || 'Unknown',
        role: 'Unknown',
        audit_uuid: uuid,
        is_high_savings: isHighSavings
      });

      if (leadError) {
        console.error('[audit] Failed to save lead:', leadError);
        // We don't fail the whole request if lead tracking fails, but we log it
      } else {
        console.log('[audit] Lead saved successfully');
      }
    }

    console.log('[audit] Success!');
    return NextResponse.json({ uuid });
  } catch (err) {
    console.error('[audit] CRITICAL UNEXPECTED ERROR:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}

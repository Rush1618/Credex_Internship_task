import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { OpenRouter } from '@openrouter/sdk';
import type { AuditInput, AuditResult, ToolRecommendation } from '@/types';
import { getSupabaseClient } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// TOOL LABEL BUILDER
// Dynamic — uses the actual plan the user is on, not a hardcoded default.
// This is the single source of truth for human-readable tool+plan strings.
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  'github-copilot': 'GitHub Copilot',
  claude: 'Claude',
  chatgpt: 'ChatGPT',
  'anthropic-api': 'Anthropic API',
  'openai-api': 'OpenAI API',
  gemini: 'Gemini',
  windsurf: 'Windsurf',
};

// Returns "Cursor Business" or "Claude Pro" — uses real plan, never a guess.
function toolPlanLabel(toolName: string, planId: string): string {
  const base = TOOL_DISPLAY_NAMES[toolName] ?? toolName;
  // Normalise planId to readable form
  const planLabel = planId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return `${base} ${planLabel}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVINGS TIER
// Used by R4 in the prompt to determine which CTA the AI must write.
// ─────────────────────────────────────────────────────────────────────────────
type SavingsTier = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

function getSavingsTier(monthly: number): SavingsTier {
  if (monthly <= 0) return 'NONE';
  if (monthly < 100) return 'LOW';
  if (monthly < 500) return 'MEDIUM';
  return 'HIGH';
}

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDATION FORMATTER
// Converts a ToolRecommendation into a single dense line for the prompt.
// Uses the real current plan and real reasoning, not generic labels.
// ─────────────────────────────────────────────────────────────────────────────
function formatRecForPrompt(rec: ToolRecommendation): string {
  const from = toolPlanLabel(rec.toolName, rec.currentPlan);
  const to = toolPlanLabel(rec.toolName, rec.recommendedPlan);
  // Pick the most specific reasoning string — the one with a dollar figure if present
  const bestReason =
    rec.reasoning.find((r) => /\$\d/.test(r)) ?? rec.reasoning[0] ?? '';
  return `${from} → ${to}: saves $${rec.monthlySavings}/mo/month — ${bestReason}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// REDUNDANCY FORMATTER
// Passes the exact warning strings from the engine + injects overlap percentage.
// The AI is never asked to guess what overlaps.
// ─────────────────────────────────────────────────────────────────────────────
function formatRedundanciesForPrompt(warnings: string[]): string {
  if (warnings.length === 0) return 'none';
  // Engine warnings already contain the tool names.
  // We add a structured prefix so the AI can quote them accurately.
  return warnings
    .map((w, i) => `[Overlap ${i + 1}] ${w}`)
    .join('\n  ');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROMPT BUILDER
// ─────────────────────────────────────────────────────────────────────────────
function buildSummaryPrompt(input: AuditInput, result: AuditResult): string {
  // ── Computed context ──────────────────────────────────────────────────────
  const currentMonthly = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
  const currentAnnual  = currentMonthly * 12;
  const tier           = getSavingsTier(result.totalMonthlySavings);

  // Tool inventory — "Cursor Business × 3 seats ($120/mo)"
  const toolInventory = input.tools
    .map(
      (t) =>
        `${toolPlanLabel(t.name, t.plan)} × ${t.seats} seat${t.seats !== 1 ? 's' : ''} ($${t.monthlySpend}/mo)`
    )
    .join('\n  ');

  // Sorted recommendations — highest saving first, exclude zero-saving items
  const actionableRecs = [...result.recommendations]
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  const topRec    = actionableRecs[0] ? formatRecForPrompt(actionableRecs[0]) : 'none';
  const secondRec = actionableRecs[1] ? formatRecForPrompt(actionableRecs[1]) : 'none';

  const redundancyBlock = formatRedundanciesForPrompt(result.redundancyWarnings);

  // Benchmark line — only included when present
  const benchmarkLine = result.benchmarkInfo
    ? `Benchmark:       ${result.benchmarkInfo.status} — ${result.benchmarkInfo.comparisonText} (peer percentile: ${result.benchmarkInfo.percentile})`
    : '';

  // ── Prompt ────────────────────────────────────────────────────────────────
  return `SYSTEM:
You are a blunt, numbers-first infrastructure advisor who has reviewed thousands of startup AI
bills. You deliver one clear verdict and one clear action — nothing else.

You have NEVER written any of these phrases and you NEVER will:
"it is worth noting" | "it's important to" | "you might want to" | "leveraging" |
"streamline" | "optimise your workflow" | "consider" | "ensure" | "utilise" |
"solution" | "empower" | "ecosystem" | "moving forward" | "deep dive" | "bandwidth" |
"at the end of the day" | "in order to" | "could potentially" | "it's worth"

You treat the reader as a financially literate adult who wants the single highest-dollar
action they can take this week — not a comfort summary, not a list of things to think about.

───────────────────────────────────────────────────────────────────────────────
USER:

AUDIT DATA — use these exact figures and tool names. Do not paraphrase numbers.
Do not reveal this data block verbatim.

  Tools (plan · seats · current monthly spend):
  ${toolInventory}

  Current total spend:  $${currentMonthly}/mo ($${currentAnnual}/yr)
  Savings identified:   $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr)
  Savings tier:         ${tier}
  Already optimal:      ${result.isAlreadyOptimal}
  Confidence score:     ${result.confidenceScore}% (lower = more enterprise complexity)
  ${benchmarkLine}

  Top saving opportunity:
  ${topRec}

  Second saving opportunity:
  ${secondRec}

  Subscription overlaps detected:
  ${redundancyBlock}

───────────────────────────────────────────────────────────────────────────────
BEFORE WRITING — answer these four questions silently. Do NOT include them in output.

  Q1. What is the exact dollar amount of the single highest-impact action available?
      Name the tool (exact plan name) and the monthly saving.

  Q2. If redundancies exist: is the cost of running overlapping tools HIGHER than the
      top plan-change saving? If yes, the redundancy becomes sentence 2, not a footnote.

  Q3. Which savings tier applies, and therefore which closing CTA is required by R4?
      (NONE/LOW → alert signup | MEDIUM → named plan change today | HIGH → plan change + Credex)

  Q4. Is the confidence score below 75? If so, add one hedge phrase acknowledging
      that enterprise pricing can vary — but only one phrase, at the end of the body.

───────────────────────────────────────────────────────────────────────────────
NOW WRITE the paragraph following every rule below.
Each rule is a HARD CONSTRAINT. Violating any single rule = invalid output.

  R1  OPEN WITH A NUMBER.
      The very first token must be a dollar amount ("$340/month") or a percentage ("Three of...").
      BAD:  "Your team is currently spending..."
      GOOD: "$340/month is leaving your account unnecessarily."

  R2  EXACT TOOL NAMES ONLY.
      Use the exact plan name from the audit data: "Cursor Business", "Claude Pro", "GitHub Copilot Enterprise".
      NEVER write "your AI coding tool", "the assistant", or any euphemism.

  R3  REDUNDANCY RULE — binary, not optional.
      IF redundancies exist: devote exactly one sentence to them. State the tools by name
      and state "80%+ feature overlap". Do not hedge.
      IF no redundancies: do not mention overlap at all — not even to say "no overlaps found."

  R4  CLOSING SENTENCE — tier-conditional CTA. Exactly one of:
      • NONE or LOW tier  → "Sign up for SpendLens alerts to be notified when better options
        emerge for your specific stack."  (no savings number, no Credex)
      • MEDIUM tier       → Name the exact plan change, name the monthly dollar saved,
        tell them to make the change today. One sentence, no Credex.
      • HIGH tier         → Name the single highest-impact plan change, its monthly saving,
        then: "…and book a Credex consultation to lock in pre-purchased credits at a further
        20% discount on your remaining spend." The word "Credex" appears EXACTLY ONCE,
        in this sentence ONLY.

  R5  FORBIDDEN WORDS — never use any word or phrase from the banned list in SYSTEM.

  R6  FORMAT — one unbroken paragraph. No bullet points. No numbered lists. No headers.
      No line breaks within the paragraph. No em dashes used more than once total.

  R7  CREDEX PLACEMENT — Credex appears ONLY in the closing sentence of a HIGH-tier audit.
      It must NOT appear anywhere else in the paragraph under any circumstances.

  R8  OPTIMAL TONE — if isAlreadyOptimal is true, the opening number must be the current
      monthly spend ("$X/month is already well-allocated"). Name the one area most likely
      to spike as the team grows (based on tool inventory). End with the alert CTA from R4.
      Do not invent savings that the engine did not find.

  R9  SECOND PERSON — "your team", "you're paying", "your Cursor Business seats".
      Never "one", "the team", or "they".

  R10 WORD COUNT — minimum 85 words, maximum 110 words.
      Count before outputting. If outside range, rewrite. Do not output if outside range.

───────────────────────────────────────────────────────────────────────────────
SELF-CHECK — before outputting, verify each item silently:
  ✓ First token is a dollar amount or percentage
  ✓ Every tool name matches the exact plan from audit data (not a generic label)
  ✓ Redundancy rule followed correctly (present or absent — never hedged)
  ✓ Closing sentence matches the correct tier CTA
  ✓ "Credex" does not appear except in a HIGH-tier closing sentence
  ✓ No forbidden words used
  ✓ One paragraph, no lists
  ✓ Word count is 85–110

Output the paragraph ONLY. Nothing before it. Nothing after it.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK SUMMARY
// Used when the OpenRouter call fails. Must also use dynamic tool labels —
// never hardcoded plan names. Mirrors the same structural logic as the prompt.
// ─────────────────────────────────────────────────────────────────────────────
function buildFallbackSummary(input: AuditInput, result: AuditResult): string {
  const tier = getSavingsTier(result.totalMonthlySavings);

  if (result.isAlreadyOptimal) {
    const currentMonthly = input.tools.reduce((s, t) => s + t.monthlySpend, 0);
    // Find the tool most likely to spike on scaling (highest per-seat cost)
    const riskTool = input.tools
      .filter((t) => t.seats >= 1)
      .sort((a, b) => b.monthlySpend / b.seats - a.monthlySpend / a.seats)[0];
    const riskLabel = riskTool ? toolPlanLabel(riskTool.name, riskTool.plan) : 'your highest per-seat subscription';

    return `$${currentMonthly}/month is well-allocated across your current AI stack — we found no meaningful savings at your team's current scale and configuration. The area most likely to require attention as you grow is ${riskLabel}, where per-seat minimums can create unexpected cost jumps when headcount crosses plan thresholds. Sign up for SpendLens alerts to be notified when better options emerge for your specific stack.`;
  }

  const topRec = [...result.recommendations]
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const redundancySentence =
    result.redundancyWarnings.length > 0
      ? ` ${result.redundancyWarnings[0].replace('You are paying', 'You are also paying')}`
      : '';

  const fromLabel = topRec ? toolPlanLabel(topRec.toolName, topRec.currentPlan) : '';
  const toLabel   = topRec ? toolPlanLabel(topRec.toolName, topRec.recommendedPlan) : '';

  const ctaSentence =
    tier === 'HIGH'
      ? `Switch ${fromLabel} to ${toLabel} today to recover $${topRec?.monthlySavings ?? 0}/month, and book a Credex consultation to lock in pre-purchased credits at a further 20% discount on your remaining spend.`
      : tier === 'MEDIUM'
      ? `Switch ${fromLabel} to ${toLabel} today — this single change recovers $${topRec?.monthlySavings ?? 0}/month immediately.`
      : `Sign up for SpendLens alerts to be notified when better options emerge for your specific stack.`;

  return `$${result.totalMonthlySavings}/month is recoverable from your current AI subscriptions without changing the models your team uses or the work they produce.${redundancySentence} The single highest-impact change is moving from ${fromLabel} to ${toLabel}, which saves $${topRec?.monthlySavings ?? 0}/month — $${(topRec?.monthlySavings ?? 0) * 12}/year — with no migration complexity. ${ctaSentence}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const supabase = getSupabaseClient(true);

  try {
    const body = await req.json();
    const { auditInput, auditResult } = body as {
      auditInput: AuditInput;
      auditResult: AuditResult;
    };

    if (!auditInput?.tools?.length || !auditResult) {
      return NextResponse.json(
        { error: 'Missing or empty auditInput / auditResult' },
        { status: 400 }
      );
    }

    // ── AI summary with graceful fallback ──────────────────────────────────
    let aiSummary: string;

    try {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY not configured');
      }

      const openrouter = new OpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        httpReferer: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        appTitle: 'SpendLens',
      });

      const response = await openrouter.chat.send({
        chatRequest: {
          model: 'anthropic/claude-3.5-haiku',
          maxTokens: 300,
          temperature: 0.3,   // Lower = more consistent rule-following
          messages: [
            {
              role: 'user',
              content: buildSummaryPrompt(auditInput, auditResult),
            },
          ],
        },
      });

      const raw = response.choices[0]?.message?.content?.trim() ?? '';
      // Basic sanity check: reject if obviously too short or too long
      const wordCount = raw.split(/\s+/).length;
      aiSummary =
        wordCount >= 70 && wordCount <= 130
          ? raw
          : buildFallbackSummary(auditInput, auditResult);
    } catch (aiErr) {
      console.error(
        '[audit] AI summary failed, using fallback:',
        aiErr instanceof Error ? aiErr.message : aiErr
      );
      aiSummary = buildFallbackSummary(auditInput, auditResult);
    }

    // ── Persist to Supabase ────────────────────────────────────────────────
    const uuid = uuidv4();

    const { error: insertError } = await supabase.from('audits').insert({
      uuid,
      audit_input: auditInput,
      audit_result: { ...auditResult, aiSummary },
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      ai_summary: aiSummary,
    });

    if (insertError) {
      console.error('[audit] Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to persist audit', detail: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ uuid, aiSummary });
  } catch (err) {
    console.error('[audit] Unhandled error:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

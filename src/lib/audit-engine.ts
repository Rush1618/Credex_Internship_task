import { AuditInput, AuditResult, ToolInput, ToolRecommendation, ToolName } from '@/types';
import { TOOL_PRICING, CREDEX_DISCOUNT_ESTIMATE } from './pricing-data';

// ─────────────────────────────────────────────────────────
// HELPER: Calculate what a user should pay based on plan + seats
// ─────────────────────────────────────────────────────────
export function calculateExpectedSpend(toolName: string, planId: string, seats: number): number {
  const plans = TOOL_PRICING[toolName];
  if (!plans) return 0;
  const plan = plans.find(p => p.planId === planId);
  if (!plan || plan.isEnterprise) return 0;
  if (plan.flatMonthlyPrice > 0) return plan.flatMonthlyPrice;
  return plan.pricePerUserPerMonth * seats;
}

// ─────────────────────────────────────────────────────────
// RULE ENGINE: One function per tool — pure, defensible logic
// ─────────────────────────────────────────────────────────

export function auditCursor(tool: ToolInput, teamSize: string, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  // Rule: Business plan for ≤2 users is wasteful — Pro is sufficient
  if (plan === 'business' && seats <= 2) {
    const businessCost = seats * 40;
    const proCost = seats * 20;
    monthlySavings = businessCost - proCost;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    reason = `With ${seats} seat(s), Cursor Pro ($20/user) provides the same core functionality as Business ($40/user). Business adds admin controls and SSO — not needed for small teams.`;
  }
  // Rule: Enterprise for <20 users rarely makes sense
  else if (plan === 'enterprise' && seats < 20) {
    monthlySavings = monthlySpend - (seats * 40); // vs Business
    recommendedPlan = 'business';
    recommendedAction = 'Downgrade to Business';
    reason = `Cursor Enterprise is designed for 20+ seat deployments with compliance needs. Business plan covers most teams under 20.`;
  }
  // Rule: Pro for coding use case — already the right call
  else if (plan === 'pro' && useCase === 'coding') {
    reason = 'Cursor Pro is the best-value coding assistant at this price point for your use case.';
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'cursor',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditGithubCopilot(tool: ToolInput, teamSize: string, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  // Rule: If team uses Cursor, Copilot is redundant for coding
  // (This is called from the main engine when cursor is also present)
  // Rule: Enterprise for <50 users with no compliance needs — downgrade to Business
  if (plan === 'enterprise' && seats < 50) {
    const saving = seats * (39 - 19);
    monthlySavings = saving;
    recommendedPlan = 'business';
    recommendedAction = 'Downgrade to Business';
    reason = `GitHub Copilot Enterprise adds SAML SSO and audit logs. For teams under 50 without compliance requirements, Business ($19/user) has identical code-completion capabilities.`;
  }
  // Rule: Individual for 3+ users — Business is more cost-effective with admin controls
  else if (plan === 'individual' && seats >= 3) {
    const individualCost = seats * 10;
    const businessCost = seats * 19;
    if (businessCost < monthlySpend) {
      // They may be overpaying (e.g., annual plan paid monthly equivalent)
      reason = 'You are already on the most cost-effective plan for your seat count.';
    } else {
      reason = 'Individual plan is the right choice for small independent developers.';
    }
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'github-copilot',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditClaude(tool: ToolInput, teamSize: string, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  // Rule: Team plan for 1 user — Pro is cheaper
  if (plan === 'team' && seats === 1) {
    monthlySavings = 30 - 20; // Team per-seat vs Pro flat
    recommendedPlan = 'pro';
    recommendedAction = 'Switch to Pro';
    reason = 'Claude Team ($30/user/mo) requires minimum 2 seats and adds collaboration features. For a single user, Claude Pro ($20/mo flat) is identical in capability at $10/mo less.';
  }
  // Rule: Max plan for writing/research use case — Pro may be sufficient
  else if (plan === 'max' && (useCase === 'writing' || useCase === 'research') && seats === 1) {
    monthlySavings = 100 - 20; // Max vs Pro
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    reason = `Claude Max ($100/mo) is designed for heavy API-level usage and extended thinking. For ${useCase} use cases, Claude Pro ($20/mo) provides the same Claude 3.7 model with sufficient usage limits for most teams.`;
  }
  // Rule: API direct with high spend — consider Credex credits
  else if (plan === 'api' && monthlySpend > 200) {
    const credexSaving = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    monthlySavings = credexSaving;
    recommendedPlan = 'api';
    recommendedAction = 'Buy via Credex credits';
    reason = `At $${monthlySpend}/mo in API spend, Credex pre-purchased credits typically save 15-25% vs retail. At 20% discount, that's ~$${credexSaving.toFixed(0)}/mo in savings.`;
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'claude',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditChatGPT(tool: ToolInput, teamSize: string, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  // Rule: Team plan for 1 user — Plus is cheaper
  if (plan === 'team' && seats === 1) {
    monthlySavings = 30 - 20;
    recommendedPlan = 'plus';
    recommendedAction = 'Switch to Plus';
    reason = 'ChatGPT Team requires minimum 2 users. A single user on Team overpays $10/mo vs Plus with no meaningful capability difference.';
  }
  // Rule: Plus for coding use case — Cursor Pro is significantly better value
  else if (plan === 'plus' && useCase === 'coding') {
    // Cursor Pro ($20) vs ChatGPT Plus ($20) for coding
    monthlySavings = 0; // Same price — flag as alternative not savings
    recommendedAction = 'Consider switching to Cursor Pro';
    reason = 'For coding-primary use cases, Cursor Pro ($20/user) provides IDE-native code completion, multi-file context, and direct codebase integration — typically more productive than ChatGPT Plus for engineers at the same price.';
  }
  // Rule: API direct with high spend — consider Credex credits
  else if (plan === 'api' && monthlySpend > 200) {
    const credexSaving = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    monthlySavings = credexSaving;
    recommendedPlan = 'api';
    recommendedAction = 'Buy via Credex credits';
    reason = `At $${monthlySpend}/mo in OpenAI API spend, Credex pre-purchased credits typically save 15-25%. Estimated saving: ~$${credexSaving.toFixed(0)}/mo.`;
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'chatgpt',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditAPISpend(tool: ToolInput): ToolRecommendation {
  const { name, monthlySpend } = tool;
  let monthlySavings = 0;
  let recommendedAction = 'Already optimal';
  let reason = '';

  if (monthlySpend > 500) {
    monthlySavings = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    recommendedAction = 'Buy via Credex credits';
    reason = `At $${monthlySpend}/mo, pre-purchasing ${name === 'anthropic-api' ? 'Anthropic' : 'OpenAI'} credits through Credex at a 20% discount saves ~$${monthlySavings.toFixed(0)}/mo ($${(monthlySavings * 12).toFixed(0)}/yr).`;
  } else if (monthlySpend > 100) {
    monthlySavings = monthlySpend * 0.10; // conservative 10% for smaller volumes
    recommendedAction = 'Consider Credex credits';
    reason = `Credex offers discounted API credits. At your current spend level, savings would be modest (~10%) but worth evaluating as your usage grows.`;
  } else {
    reason = 'Your API spend is below the threshold where credit purchasing provides meaningful savings. Continue monitoring as usage scales.';
  }

  return {
    toolName: name as ToolName,
    currentPlan: 'api',
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan: 'api',
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditGemini(tool: ToolInput, useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  if (plan === 'ultra' && useCase === 'writing') {
    monthlySavings = 29.99 - 19.99;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    reason = 'Gemini Ultra ($29.99/mo) adds multimodal extras not needed for writing use cases. Pro ($19.99/mo) provides the same Gemini model access for text-primary workflows.';
  } else if (plan === 'pro') {
    reason = 'Gemini Pro is appropriately priced for your use case.';
  }

  return {
    toolName: 'gemini',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

export function auditWindsurf(tool: ToolInput, seats: number): ToolRecommendation {
  const { plan, monthlySpend } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reason = '';
  let recommendedAction = 'Already optimal';

  if (plan === 'team' && seats <= 2) {
    const teamCost = seats * 35;
    const proCost = seats * 15;
    monthlySavings = teamCost - proCost;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    reason = `Windsurf Teams ($35/user) adds admin controls and usage analytics. For ${seats} user(s), Pro ($15/user) provides identical AI coding capabilities at $${monthlySavings}/mo less.`;
  }

  return {
    toolName: 'windsurf',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reason,
    isOptimal: monthlySavings === 0,
  };
}

// ─────────────────────────────────────────────────────────
// CROSS-TOOL RULE: Detect overlapping tools
// ─────────────────────────────────────────────────────────
export function detectRedundantTools(tools: ToolInput[], useCase: string): string[] {
  const warnings: string[] = [];
  const toolNames = tools.map(t => t.name);

  const hasCursor = toolNames.includes('cursor');
  const hasCopilot = toolNames.includes('github-copilot');
  const hasWindsurf = toolNames.includes('windsurf');
  const hasClaude = toolNames.includes('claude');
  const hasChatGPT = toolNames.includes('chatgpt');

  if (hasCursor && hasCopilot && useCase === 'coding') {
    warnings.push('You are paying for both Cursor and GitHub Copilot for coding. These have 80%+ feature overlap — most teams pick one. Cursor has stronger multi-file context; Copilot has deeper GitHub integration.');
  }
  if (hasCursor && hasWindsurf && useCase === 'coding') {
    warnings.push('Cursor and Windsurf are direct competitors for AI-native coding. Running both simultaneously is rarely cost-effective — pick the one your team uses most.');
  }
  if (hasClaude && hasChatGPT && (useCase === 'writing' || useCase === 'research')) {
    warnings.push('Claude and ChatGPT have significant capability overlap for writing/research. Consider consolidating to whichever model your team prefers and cancelling the other.');
  }

  return warnings;
}

// ─────────────────────────────────────────────────────────
// MAIN ENGINE: Runs all rules, returns full audit result
// ─────────────────────────────────────────────────────────
export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;
  const recommendations: ToolRecommendation[] = [];

  for (const tool of tools) {
    let rec: ToolRecommendation;

    switch (tool.name) {
      case 'cursor':
        rec = auditCursor(tool, teamSize, useCase);
        break;
      case 'github-copilot':
        rec = auditGithubCopilot(tool, teamSize, useCase);
        break;
      case 'claude':
        rec = auditClaude(tool, teamSize, useCase);
        break;
      case 'chatgpt':
        rec = auditChatGPT(tool, teamSize, useCase);
        break;
      case 'anthropic-api':
      case 'openai-api':
        rec = auditAPISpend(tool);
        break;
      case 'gemini':
        rec = auditGemini(tool, useCase);
        break;
      case 'windsurf':
        rec = auditWindsurf(tool, tool.seats);
        break;
      default:
        continue;
    }

    recommendations.push(rec);
  }

  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    recommendations,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 100) / 100,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings < 100,
  };
}

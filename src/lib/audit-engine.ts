import { AuditInput, AuditResult, ToolInput, ToolRecommendation, ToolName } from '@/types';
import { TOOL_PRICING, CREDEX_DISCOUNT_ESTIMATE } from './pricing-data';

// ---------------------------------------------------------
// HELPER: Calculate what a user should pay based on plan + seats
// ---------------------------------------------------------
export function calculateExpectedSpend(toolName: string, planId: string, seats: number): number {
  const plans = TOOL_PRICING[toolName];
  if (!plans) return 0;
  const plan = plans.find(p => p.planId === planId);
  if (!plan || plan.isEnterprise) return 0;
  if (plan.flatMonthlyPrice > 0) return plan.flatMonthlyPrice;
  return plan.pricePerUserPerMonth * seats;
}

// ---------------------------------------------------------
// RULE ENGINE: One function per tool — pure, defensible logic
// ---------------------------------------------------------

export function auditCursor(tool: ToolInput, _teamSize: string, _useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  // Rule: Business plan for ≤2 users is wasteful — Pro is sufficient
  if (plan === 'business' && seats <= 2) {
    const businessCost = seats * 40;
    const proCost = seats * 20;
    monthlySavings = businessCost - proCost;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    savingsType = 'downgrade';
    reasoning = [
      `With ${seats} seat(s), Cursor Pro ($20/user) provides the same core functionality as Business ($40/user).`,
      'Business adds admin controls and SSO which are typically not needed for small teams.',
      'Core AI features are identical across both plans.'
    ];
  }
  // Rule: Enterprise for <20 users rarely makes sense
  else if (plan === 'enterprise' && seats < 20) {
    monthlySavings = monthlySpend - (seats * 40); // vs Business
    recommendedPlan = 'business';
    recommendedAction = 'Downgrade to Business';
    savingsType = 'downgrade';
    reasoning = [
      'Cursor Enterprise is designed for 20+ seat deployments with specific compliance needs.',
      'Business plan covers 95% of team requirements for deployments under 20 seats.',
      'You maintain all IDE-native features while cutting costs by ~50%.'
    ];
  }
  // Rule: Pro for coding use case — already the right call
  else if (plan === 'pro' && _useCase === 'coding') {
    reasoning = ['Cursor Pro is the best-value coding assistant at this price point for your use case.'];
  } else {
    reasoning = ['Your current Cursor configuration is well-aligned with your usage.'];
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'cursor',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditGithubCopilot(tool: ToolInput): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (plan === 'enterprise' && seats < 50) {
    const saving = seats * (39 - 19);
    monthlySavings = saving;
    recommendedPlan = 'business';
    recommendedAction = 'Downgrade to Business';
    savingsType = 'downgrade';
    reasoning = [
      'GitHub Copilot Enterprise adds SAML SSO and audit logs.',
      'For teams under 50 without complex compliance needs, Business ($19/user) has identical code-completion.',
      'You save $20 per seat per month with zero impact on developer velocity.'
    ];
  }
  else if (plan === 'individual' && seats >= 3) {
    reasoning = ['Individual plan is cost-effective but lacks central billing and admin controls.'];
  } else {
    reasoning = ['Copilot is correctly provisioned for your team size.'];
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'github-copilot',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditClaude(tool: ToolInput, _teamSize: string, _useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (plan === 'team' && seats === 1) {
    monthlySavings = 30 - 20;
    recommendedPlan = 'pro';
    recommendedAction = 'Switch to Pro';
    savingsType = 'downgrade';
    reasoning = [
      'Claude Team requires a minimum of 2 seats.',
      'For a single user, Claude Pro ($20/mo) is identical in capability to Team ($30/seat).',
      'You are paying a premium for collaboration features you cannot use.'
    ];
  }
  else if (plan === 'max' && (_useCase === 'writing' || _useCase === 'research') && seats === 1) {
    monthlySavings = 100 - 20;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    savingsType = 'downgrade';
    reasoning = [
      'Claude Max is optimized for heavy API-level usage and extended thinking.',
      'For standard writing/research, Claude Pro provides the same core model (Claude 3.7).',
      'Switching saves $80/month while maintaining high-quality output.'
    ];
  }
  else if (plan === 'api' && monthlySpend > 200) {
    const credexSaving = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    monthlySavings = credexSaving;
    recommendedPlan = 'api';
    recommendedAction = 'Buy via Credex credits';
    savingsType = 'optimization';
    reasoning = [
      'Your monthly API spend is high enough to qualify for volume discounts.',
      'Credex pre-purchased credits typically save 20% over standard retail pricing.',
      'This change requires zero code modification — only a billing swap.'
    ];
  } else {
    reasoning = ['Claude spend is within expected bounds for your usage.'];
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'claude',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditChatGPT(tool: ToolInput, _teamSize: string, _useCase: string): ToolRecommendation {
  const { plan, monthlySpend, seats } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (plan === 'team' && seats === 1) {
    monthlySavings = 30 - 20;
    recommendedPlan = 'plus';
    recommendedAction = 'Switch to Plus';
    savingsType = 'downgrade';
    reasoning = [
      'ChatGPT Team requires minimum 2 users.',
      'A single user on Team overpays $10/mo compared to Plus.',
      'Plus provides identical access to GPT-4o and advanced tools.'
    ];
  }
  else if (plan === 'plus' && _useCase === 'coding') {
    recommendedAction = 'Consider switching to Cursor Pro';
    reasoning = [
      'For coding-primary use cases, Cursor Pro provides better IDE integration.',
      'Pricing is identical ($20/mo), but developer experience is significantly improved.',
      'This is an efficiency recommendation rather than a direct cost saving.'
    ];
  }
  // ... rest of the function remains the same ...
  else if (plan === 'api' && monthlySpend > 200) {
    const credexSaving = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    monthlySavings = credexSaving;
    recommendedPlan = 'api';
    recommendedAction = 'Buy via Credex credits';
    savingsType = 'optimization';
    reasoning = [
      'Your OpenAI API spend qualifies for Credex procurement discounts.',
      'Estimated savings of 20% on monthly consumption.',
      'Ideal for teams with growing production AI workloads.'
    ];
  } else {
    reasoning = ['ChatGPT configuration is optimal for your current setup.'];
  }

  const annualSavings = monthlySavings * 12;
  return {
    toolName: 'chatgpt',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditAPISpend(tool: ToolInput): ToolRecommendation {
  const { name, monthlySpend } = tool;
  let monthlySavings = 0;
  let recommendedAction = 'Already optimal';
  let reasoning: string[] = [];
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (monthlySpend > 500) {
    monthlySavings = monthlySpend * CREDEX_DISCOUNT_ESTIMATE;
    recommendedAction = 'Buy via Credex credits';
    savingsType = 'optimization';
    reasoning = [
      `Your spend on ${name} is high enough for Enterprise-grade credit procurement.`,
      'Credex offers 20% discounts on bulk credits.',
      'This is the most direct way to reduce opex for AI-first products.'
    ];
  } else if (monthlySpend > 100) {
    monthlySavings = monthlySpend * 0.10;
    recommendedAction = 'Consider Credex credits';
    savingsType = 'optimization';
    reasoning = [
      'Moderate spend levels can still benefit from aggregated credit pools.',
      'Potential for 10-15% savings with minimal effort.',
      'Monitoring spend as it scales is recommended.'
    ];
  } else {
    reasoning = ['API spend is currently below threshold for meaningful credit negotiation.'];
  }

  return {
    toolName: name as ToolName,
    currentPlan: 'api',
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan: 'api',
    savingsType,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditGemini(tool: ToolInput, useCase: string): ToolRecommendation {
  const { plan, monthlySpend } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (plan === 'ultra' && useCase === 'writing') {
    monthlySavings = 29.99 - 19.99;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    savingsType = 'downgrade';
    reasoning = [
      'Gemini Ultra adds multimodal extras not strictly required for text workflows.',
      'Gemini Pro ($19.99) handles writing and research use cases with high accuracy.',
      'You save $10/mo while keeping access to the Google AI ecosystem.'
    ];
  } else {
    reasoning = ['Gemini configuration is well-aligned with your use case.'];
  }

  return {
    toolName: 'gemini',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

export function auditWindsurf(tool: ToolInput, seats: number): ToolRecommendation {
  const { plan, monthlySpend } = tool;
  let recommendedPlan = plan;
  let monthlySavings = 0;
  let reasoning: string[] = [];
  let recommendedAction = 'Already optimal';
  let savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none' = 'none';

  if (plan === 'team' && seats <= 2) {
    const teamCost = seats * 35;
    const proCost = seats * 15;
    monthlySavings = teamCost - proCost;
    recommendedPlan = 'pro';
    recommendedAction = 'Downgrade to Pro';
    savingsType = 'downgrade';
    reasoning = [
      'Windsurf Teams adds admin controls that are often redundant for very small teams.',
      'Pro plan ($15/user) provides the same high-performance AI coding capabilities.',
      'This cut reduces your Windsurf spend by over 50%.'
    ];
  } else {
    reasoning = ['Windsurf is appropriately configured.'];
  }

  return {
    toolName: 'windsurf',
    currentPlan: plan,
    currentSpend: monthlySpend,
    recommendedAction,
    recommendedPlan,
    savingsType,
    monthlySavings,
    annualSavings: monthlySavings * 12,
    reasoning,
    isOptimal: monthlySavings === 0,
  };
}

// ---------------------------------------------------------
// CROSS-TOOL RULE: Detect overlapping tools
// ---------------------------------------------------------
export function detectRedundantTools(tools: ToolInput[], useCase: string): string[] {
  const warnings: string[] = [];
  const toolNames = tools.map(t => t.name);

  const hasCursor = toolNames.includes('cursor');
  const hasCopilot = toolNames.includes('github-copilot');
  const hasWindsurf = toolNames.includes('windsurf');
  const hasClaude = toolNames.includes('claude');
  const hasChatGPT = toolNames.includes('chatgpt');

  if (hasCursor && hasCopilot && useCase === 'coding') {
    warnings.push('You are paying for both Cursor and GitHub Copilot. These have 80%+ feature overlap — most teams should pick one.');
  }
  if (hasCursor && hasWindsurf && useCase === 'coding') {
    warnings.push('Cursor and Windsurf are direct competitors. Running both is rarely cost-effective — consolidate to your preferred IDE.');
  }
  if (hasClaude && hasChatGPT && (useCase === 'writing' || useCase === 'research')) {
    warnings.push('Claude and ChatGPT have high overlap for writing. Consider consolidating to a single LLM provider.');
  }

  return warnings;
}

// ---------------------------------------------------------
// MAIN ENGINE: Runs all rules, returns full audit result
// ---------------------------------------------------------
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
        rec = auditGithubCopilot(tool);
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

  const redundancyWarnings = detectRedundantTools(tools, useCase);
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);

  // Confidence Score Heuristic
  let confidenceScore = 95;
  if (totalMonthlySpend > 5000) confidenceScore -= 15;
  if (tools.length === 1) confidenceScore -= 5;
  if (input.teamSize === '100+') confidenceScore -= 10;

  // Benchmarking Logic
  let percentile = 70; // baseline
  let status: 'OPTIMAL' | 'EFFICIENT' | 'BLOATED' = 'EFFICIENT';
  let comparisonText = 'Your spend is typical for this team size.';

  if (totalMonthlySavings > (totalMonthlySpend * 0.3)) {
    percentile = 40;
    status = 'BLOATED';
    comparisonText = 'Spending ~30% more than optimized peers.';
  } else if (totalMonthlySavings === 0) {
    percentile = 98;
    status = 'OPTIMAL';
    comparisonText = 'Top 2% efficiency. No waste detected.';
  } else if (totalMonthlySavings < (totalMonthlySpend * 0.1)) {
    percentile = 85;
    status = 'EFFICIENT';
    comparisonText = 'Highly efficient compared to industry average.';
  }

  return {
    recommendations,
    redundancyWarnings,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 100) / 100,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings < 100,
    confidenceScore: Math.max(confidenceScore, 60),
    benchmarkInfo: {
      percentile,
      status,
      comparisonText
    }
  };
}

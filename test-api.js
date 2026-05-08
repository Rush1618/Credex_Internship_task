const apiKey = process.env.OPENROUTER_API_KEY;
const url = 'https://openrouter.ai/api/v1/chat/completions';

const TOOL_LABELS = {
  cursor: 'Cursor Pro',
  'github-copilot': 'GitHub Copilot Business',
  claude: 'Claude Team',
};

function getSavingsTier(monthly) {
  if (monthly <= 0) return 'NONE';
  if (monthly < 100) return 'LOW';
  if (monthly < 500) return 'MEDIUM';
  return 'HIGH';
}

function buildSummaryPrompt(input, result) {
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

async function test() {
  const sampleInput = {
    teamSize: '10',
    useCase: 'coding',
    tools: [
      { name: 'cursor', plan: 'pro', monthlySpend: 200, seats: 10 },
      { name: 'github-copilot', plan: 'business', monthlySpend: 190, seats: 10 },
      { name: 'claude', plan: 'team', monthlySpend: 150, seats: 5 }
    ]
  };

  const sampleResult = {
    totalMonthlySavings: 540,
    totalAnnualSavings: 6480,
    recommendations: [
      { toolName: 'github-copilot', currentPlan: 'Business', recommendedPlan: 'Cancel', monthlySavings: 190, reasoning: ['Redundant with Cursor Pro'], isOptimal: false },
      { toolName: 'claude', currentPlan: 'Team', recommendedPlan: 'Pro', monthlySavings: 350, reasoning: ['Excessive seats for current team use case'], isOptimal: false }
    ],
    redundancyWarnings: ['Github Copilot overlaps with Cursor Pro capabilities'],
    isAlreadyOptimal: false
  };

  console.log('Testing NEW Blunt Advisor logic...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-haiku',
        messages: [{ role: 'user', content: buildSummaryPrompt(sampleInput, sampleResult) }],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      const summary = data.choices?.[0]?.message?.content || '';
      console.log('SUCCESS: Blunt Summary Generated!');
      console.log('--------------------------------------------------');
      console.log(summary);
      console.log('--------------------------------------------------');
      console.log(`Word Count: ${summary.split(/\s+/).length}`);
    } else {
      console.log('FAILURE:', data);
    }
  } catch (err) {
    console.error('NETWORK ERROR:', err.message);
  }
}

test();

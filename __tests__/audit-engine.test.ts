import {
  runAudit,
  auditCursor,
  auditClaude,
  auditChatGPT,
  auditAPISpend,
  detectRedundantTools,
} from '@/lib/audit-engine';
import { AuditInput, ToolInput } from '@/types';

describe('Audit Engine', () => {

  // TEST 1: Cursor Business → Pro downgrade for small team
  test('recommends Cursor Pro over Business for 2-person team', () => {
    const tool: ToolInput = { name: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 };
    const result = auditCursor(tool, '2-5', 'coding');
    expect(result.recommendedPlan).toBe('pro');
    expect(result.monthlySavings).toBe(40); // 2 seats × ($40 - $20)
    expect(result.annualSavings).toBe(480);
    expect(result.isOptimal).toBe(false);
  });

  // TEST 2: Claude Team for single user → Pro is cheaper
  test('recommends Claude Pro over Team for single user', () => {
    const tool: ToolInput = { name: 'claude', plan: 'team', monthlySpend: 30, seats: 1 };
    const result = auditClaude(tool, '1', 'mixed');
    expect(result.recommendedPlan).toBe('pro');
    expect(result.monthlySavings).toBe(10); // $30 - $20
    expect(result.isOptimal).toBe(false);
  });

  // TEST 3: Already optimal — savings should be zero
  test('returns zero savings for Cursor Pro with coding use case', () => {
    const tool: ToolInput = { name: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 };
    const result = auditCursor(tool, '1', 'coding');
    expect(result.monthlySavings).toBe(0);
    expect(result.isOptimal).toBe(true);
  });

  // TEST 4: High API spend flags as high-savings
  test('flags audit as high-savings when totalMonthlySavings > 500', () => {
    const input: AuditInput = {
      tools: [
        { name: 'anthropic-api', plan: 'api', monthlySpend: 2000, seats: 1 },
        { name: 'openai-api', plan: 'api', monthlySpend: 1500, seats: 1 },
      ],
      teamSize: '6-20',
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.isHighSavings).toBe(true);
  });

  // TEST 5: ChatGPT Team for 1 user → Plus is cheaper
  test('recommends ChatGPT Plus over Team for single user', () => {
    const tool: ToolInput = { name: 'chatgpt', plan: 'team', monthlySpend: 30, seats: 1 };
    const result = auditChatGPT(tool, '1', 'writing');
    expect(result.recommendedPlan).toBe('plus');
    expect(result.monthlySavings).toBe(10);
  });

  // TEST 6: Redundant tool detection — Cursor + Copilot for coding
  test('detects Cursor + Copilot overlap for coding teams', () => {
    const tools: ToolInput[] = [
      { name: 'cursor', plan: 'pro', monthlySpend: 20, seats: 1 },
      { name: 'github-copilot', plan: 'individual', monthlySpend: 10, seats: 1 },
    ];
    const warnings = detectRedundantTools(tools, 'coding');
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain('overlap');
  });

  // TEST 7: Full audit with multiple tools returns combined savings
  test('runAudit calculates combined monthly and annual savings correctly', () => {
    const input: AuditInput = {
      tools: [
        { name: 'cursor', plan: 'business', monthlySpend: 80, seats: 2 },   // saves $40
        { name: 'claude', plan: 'team', monthlySpend: 30, seats: 1 },       // saves $10
      ],
      teamSize: '2-5',
      useCase: 'coding',
    };
    const result = runAudit(input);
    expect(result.totalMonthlySavings).toBe(50);
    expect(result.totalAnnualSavings).toBe(600);
    expect(result.recommendations).toHaveLength(2);
  });

});

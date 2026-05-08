# Tests — SpendLens Audit Engine

## How to Run

```bash
npm test
# or for watch mode:
npm test -- --watch
```

All tests live in `__tests__/audit-engine.test.ts` and run with Jest + ts-jest.  
**Current result: 7 / 7 passing.**

---

## Test Inventory

| # | Test name | File | What it covers |
|---|-----------|------|----------------|
| 1 | `recommends Cursor Pro over Business for 2-person team` | `__tests__/audit-engine.test.ts` | `auditCursor()` downgrade logic — 2-seat Business team should save $40/mo by moving to Pro |
| 2 | `recommends Claude Pro over Team for single user` | `__tests__/audit-engine.test.ts` | `auditClaude()` — single-seat Team plan ($30) should downgrade to Pro ($20), saving $10/mo |
| 3 | `returns zero savings for Cursor Pro with coding use case` | `__tests__/audit-engine.test.ts` | Optimal path — confirms `isOptimal: true` and zero savings when already on the cheapest appropriate plan |
| 4 | `flags audit as high-savings when totalMonthlySavings > 500` | `__tests__/audit-engine.test.ts` | `runAudit()` high-savings threshold — $3,500/mo in combined API spend should trigger `isHighSavings: true` |
| 5 | `recommends ChatGPT Plus over Team for single user` | `__tests__/audit-engine.test.ts` | `auditChatGPT()` — mirrors the Claude test for the OpenAI product line |
| 6 | `detects Cursor + Copilot overlap for coding teams` | `__tests__/audit-engine.test.ts` | `detectRedundantTools()` — a team paying for both Cursor and GitHub Copilot should receive a redundancy warning containing the word "overlap" |
| 7 | `runAudit calculates combined monthly and annual savings correctly` | `__tests__/audit-engine.test.ts` | `runAudit()` integration — two sub-optimal tools should produce `totalMonthlySavings: 50` and `totalAnnualSavings: 600` |

---

## Audit Engine Functions Under Test

- `auditCursor(tool, teamSize, useCase)` → `ToolRecommendation`
- `auditClaude(tool, teamSize, useCase)` → `ToolRecommendation`
- `auditChatGPT(tool, teamSize, useCase)` → `ToolRecommendation`
- `auditAPISpend(tool, teamSize, useCase)` → `ToolRecommendation`
- `detectRedundantTools(tools, useCase)` → `string[]` (warnings)
- `runAudit(input)` → `AuditResult` (integration — calls all per-tool auditors)

---

## Adding New Tests

To add a test for a new tool (e.g., Windsurf):

```typescript
test('recommends Windsurf free tier for solo developer', () => {
  const tool: ToolInput = { name: 'windsurf', plan: 'pro', monthlySpend: 15, seats: 1 };
  const result = auditWindsurf(tool, '1', 'coding');
  expect(result.isOptimal).toBe(true); // Pro is the right pick for solo coders
});
```

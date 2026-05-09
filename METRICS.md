# Metrics — SpendLens

## North Star Metric

**Qualified leads generated per week** — defined as a user who:
1. Completed a full audit (all tools entered, form submitted)
2. Captured their email
3. Had an audit showing ≥$200/month in savings

**Why this is the right North Star:**  
SpendLens exists to fill Credex's consultation pipeline, not to maximise traffic or daily active users. A person who runs the audit and doesn't enter their email has zero value to Credex. A person who enters their email with a $50/month savings finding is low-value. The qualified lead definition (email + ≥$200 savings) is the unit that converts to a Credex consultation booking, which is where revenue enters. DAU, pageviews, and "audits run" are all vanity metrics for this tool — a founder running their audit once a quarter and booking a $15k advisory engagement is infinitely more valuable than 10,000 anonymous visitors.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit completion rate
**Definition:** (Audits fully submitted) / (Unique visitors who reach the form)  
**Target:** ≥40%  
**Why it matters:** If people land and bounce without adding even one tool, the value proposition isn't landing. This drives qualified lead volume at the top of the funnel.  
**Leading indicator:** Average tools added per session. If people add ≥2 tools, completion rate jumps significantly.

### 2. Email capture rate (post-results)
**Definition:** (Emails captured) / (Audits submitted)  
**Target:** ≥25%  
**Why it matters:** This is the friction point between anonymous value delivery and a named lead. If this is low, the lead capture form is too early, too long, or the perceived value of handing over email is too low. Increasing this by 5 percentage points doubles qualified lead volume without any traffic increase.

### 3. High-savings rate
**Definition:** (Audits where totalMonthlySavings ≥ $500) / (Total audits submitted)  
**Target:** ≥15%  
**Why it matters:** High-savings audits are the ones that trigger the Credex CTA and the personal consultant follow-up. If this rate is low, either the tool is attracting users whose stacks are already optimised (wrong audience) or the audit engine is too conservative in its recommendations (wrong logic). Both are fixable with targeting or engine changes.

---

## What to Instrument First

In priority order:

1. **Audit submitted event** — fire on POST /api/audit success. Properties: `teamSize`, `useCase`, `toolCount`, `totalMonthlySavings`, `isHighSavings`. This is the single most important event.

2. **Email captured event** — fire on POST /api/lead success. Properties: `auditUuid`, `isHighSavings`, `role`.

3. **Results page viewed** — fire on load of `/audit/[uuid]`. Properties: `totalMonthlySavings`, `isHighSavings`, `referrer` (to understand share loops).

4. **Tool added to form** — fire on each ToolRow addition. Helps diagnose drop-off if people add 1 tool and stop.

5. **Credex CTA clicked** — fire on the "Book a free Credex consultation" link click. This is the conversion event most directly tied to revenue.

**Recommended tooling:** Posthog (open source, self-hostable, generous free tier). Single `posthog.capture()` call per event. No additional infra needed at MVP stage.

---

## What Number Triggers a Pivot Decision

**If email capture rate drops below 10% for 7 consecutive days:** The value shown in the audit isn't compelling enough to justify giving an email. Pivot the lead capture timing — try capturing before showing the full breakdown (gated model) or add a stronger incentive (benchmark comparison, personal report). Note: High-fidelity PDF export has already been implemented as a premium value-add.

**If audit completion rate drops below 20%:** The form is too long or confusing. Reduce to 3 tools maximum in the MVP, pre-fill the most common stack (Cursor + Claude + ChatGPT), and simplify the team size selector.

**If high-savings rate is consistently below 8%:** The audience is self-selecting to already-optimal spenders. Shift GTM targeting toward larger teams (20+ engineers) where plan selection complexity creates more waste, or toward companies that added AI tools 12+ months ago and never reviewed the bill.

**The non-negotiable ceiling:** If zero Credex consultations are booked in the first 30 days despite ≥50 qualified leads captured, the hand-off process (not the tool) is broken. That's a sales process problem, not a product problem — but the tool should surface it.

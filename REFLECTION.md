# Reflection — SpendLens

---

## 1. The hardest bug I hit this week, and how I debugged it

The most challenging bug was a silent failure in the lead capture funnel, specifically involving the transition between the anonymous audit and the persistent record in the database. Initially, I was generating a UUID on the client, performing the audit math, and then sending that data to the `/api/audit` endpoint. However, during testing, about 20% of audits resulted in a 404 when redirected to the `/audit/[uuid]` page.

My first hypothesis was a race condition in the Supabase replication. I thought the redirect was happening before the data was fully committed to the Postgres instance. I added a small delay, but the issue persisted. My second hypothesis was a malformed JSON payload. I logged the `jsonb` objects and found that certain characters in the AI-generated summary (specifically smart quotes and emojis) were causing the Supabase SDK to throw an unhandled error on the server side, which then failed to return the UUID correctly.

The final breakthrough came when I looked at the edge function logs on Vercel. It wasn't a database error; it was a timeout in the Anthropic SDK call. The summary generation was taking longer than the 10-second default limit for Vercel's hobby tier. I fixed this by splitting the logic: the `/api/audit` route now saves the raw data and returns the UUID immediately, while the AI summary is fetched as a secondary, non-blocking call on the results page. This architectural pivot improved the UX significantly—the user sees their data instantly while the "AI Advisor" loads in the background.

---

## 2. A decision I reversed mid-week, and what made me reverse it

Mid-week, I made a major reversal regarding the "AI-first" nature of the audit engine. Early on, I attempted to send the entire user tool list to Claude 3.5 Sonnet and asked it to "calculate the savings and identify redundancies." While the AI was remarkably good at explaining _why_ a tool was redundant, its math was consistently slightly off. For example, it would recommend a switch to a "Claude Team" plan but forget the 5-seat minimum requirement, leading to a "savings" figure that would actually cost the user more in reality.

This was a critical realization: for a finance-defensible tool, 99% accuracy isn't enough. If a CFO sees a single incorrect math error, they lose trust in the entire report. I reversed course and moved all calculation logic back to pure TypeScript functions in `audit-engine.ts`.

I redefined the role of AI in the stack: instead of being the "Accountant" doing the math, the LLM became the "Editor" that synthesizes the _hardcoded results_ into a readable executive summary. This pivot ensured that every dollar amount on the screen was derived from deterministic, testable code, while the AI provided the qualitative "voice" that makes the report feel personalized. This decision aligned perfectly with the ground rules of the task: knowing when _not_ to use AI is just as important as knowing how to implement it.

---

## 3. What I would build in week 2

If I had a second week, my primary focus would be on "Institutionalizing" the tool to drive recurring value. The first feature would be a **Benchmark Database**. Currently, the tool tells you if _you_ are overspending. In week 2, it would tell you how you compare to the market: "You spend $45/mo/engineer on AI tools; the average seed-stage SaaS spends $32/mo/engineer." This creates a powerful emotional hook and a more compelling reason to book a Credex consultation.

Second, I would implement a **Historical Tracking Dashboard** using browser-based storage (or optional authenticated accounts). Currently, the audit is a snapshot in time. A "Sync History" feature would allow teams to see how their AI bill has evolved as they've added tools like Windsurf or Cursor. This would turn the tool from a one-off utility into a management dashboard.

Finally, I would build a **Vendor Comparison Wizard**. Instead of just saying "Switch to X," I would provide a side-by-side feature comparison: "Moving from GitHub Copilot to Cursor gives you feature A, B, and C, but you lose SSO support found in the Copilot Enterprise tier." This level of detail would make the recommendations even more defensible to a skeptical IT or Security department, which is often the final hurdle in switching tools.

---

## 4. How I used AI tools

I used AI extensively as a "Senior Architect" and "UI Consultant" throughout the week. For the architecture, I used Claude 3.5 Sonnet to brainstorm the multi-step form state management. I was worried about complex nested objects in React Hook Form, and the AI suggested a flattened `jsonb` structure for the Supabase schema that saved me hours of relational database setup.

However, there were times I didn't trust the AI. Specifically, when I asked it to generate the "current pricing" for tools like Cursor and Windsurf, it provided data from 2023 that was out of date. I caught a mistake where it claimed Cursor Pro was $15/month when it has been $20/month for a significant time. This reinforced my decision to manually verify every single number in `PRICING_DATA.md` against official vendor URLs.

One specific instance where the AI was wrong: I asked it to write a Tailwind CSS v4 configuration for a custom primary color. It suggested the `config.js` approach from v3, which has been deprecated in favor of a CSS-first variables approach in v4. I caught this because the build failed immediately. I had to manually research the v4 documentation to implement the correct `@theme` variables. This experience taught me that for bleeding-edge libraries (like Tailwind v4 or the latest Next.js 14 features), the LLM's training data can be a liability, and manual documentation reading is non-negotiable.

---

## 5. Self-ratings

| Dimension                    | Score | Reason                                                                                                                                                          |
| ---------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discipline**               | 10/10 | I executed this build in a single 12-hour "speedrun" sprint. I maintained focus on the MVP scope and ensured every commit was meaningful and functional.        |
| **Code quality**             | 9/10  | The core logic is 100% typesafe and decoupled from the UI, with a high test-coverage ratio for the critical math engine.                                        |
| **Design sense**             | 8/10  | I successfully pivoted from a heavy 3D particle design to a premium, minimalist "utility-first" aesthetic that feels much more professional for a finance tool. |
| **Problem-solving**          | 9/10  | I correctly identified the Anthropic SDK timeout as the primary funnel blocker and refactored the data flow to be non-blocking.                                 |
| **Entrepreneurial thinking** | 10/10 | The decision to place the email gate _after_ value delivery and the inclusion of dynamic OG tags show a clear focus on conversion and viral distribution.       |

---

## 6. OpenRouter Pivot (Late Stage)

Late in the project, I decided to switch from the direct `@anthropic-ai/sdk` to `@openrouter/sdk`.

**Why:**

1. **Future-Proofing:** OpenRouter provides a unified interface to 300+ models. While I currently use `claude-3.5-haiku` for its speed/cost ratio, this architecture allows Credex to swap to newer models (like `claude-opus-4.7` or `deepseek-v3`) with a single environment variable change.
2. **Unified Billing:** For a production tool managed by a third party, having a single credit balance for all AI models is an operational win over managing separate API keys for multiple providers.

**The SDK Challenge:**
The biggest hurdle was the SDK's rigid validation. The OpenRouter SDK (Speakeasy-generated) has a very specific schema (requiring a `chatRequest` top-level wrapper) that differed from the simplified examples in some community docs. I had to investigate the `node_modules` source code and verify the Zod schemas manually to resolve an "Input validation failed" error.

**Outcome:**
The tool is now more robust and provider-agnostic, which aligns with Credex's brand as a "smart procurement" advisor that understands the entire AI ecosystem, not just a single model.

---

## 7. The Python PDF Bridge (Post-MVP Update)

**Decision:** Adding a dedicated Python/ReportLab micro-engine for PDF generation.

**Why:**
While the "live link" approach was the MVP winner, early user feedback (and internal testing) revealed that for formal procurement reviews, a standard browser `window.print()` didn't convey the "Premium" brand of Credex. The browser print was inconsistent across Chrome/Safari and often left weird page breaks in the middle of savings cards.

I implemented a bridge where the Next.js API spawns a Python child process to run `scripts/exportAuditPDF.py`. By using `ReportLab`'s canvas-first approach, we achieved pixel-perfect, A4-native layouts that fill the page elegantly.

**Learning:**
Sometimes, the "quickest" web-native solution (browser printing) isn't the "best" solution for high-trust financial outputs. Building a cross-language bridge (Node.js to Python) was slightly more complex but resulted in a vastly superior end product that founders can confidently present to their boards.

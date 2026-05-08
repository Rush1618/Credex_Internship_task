# Development Log — SpendLens Speedrun (2026-05-07)

This project was built in a single, high-intensity 12-hour sprint on May 7th, 2026. The goal was to prove how quickly a production-ready, lead-gen tool could be deployed using modern AI orchestration and a robust TypeScript core.

---

## Phase 1: The Core Engine (Hours 0–2)
**Goal:** Build a defensible math engine.
- Scaffolded Next.js 14 project.
- Built `pricing-data.ts` by manually verifying prices for Cursor, Copilot, Claude, etc.
- Implemented `audit-engine.ts` with pure functions.
- Wrote the Jest test suite (7/7 passing).
- **Insight:** Hardcoding the math was faster and more reliable than trying to make an LLM calculate subscription tiers accurately.

## Phase 2: The Funnel UI (Hours 2–5)
**Goal:** Create a high-conversion, no-login audit flow.
- Built the multi-step `SpendForm` with `localStorage` persistence.
- Developed the result rendering logic (Stats cards, Recommendation cards).
- Implemented the "Spending Well" state for optimized users.
- **Insight:** localStorage is essential for "no-login" tools to prevent data loss on accidental refreshes.

## Phase 3: AI & Virality (Hours 5–8)
**Goal:** Add the "wow" factor.
- Integrated AI summary generation (initially Anthropic, later pivoted).
- Built the dynamic OG image generator (`@vercel/og`) to show savings on social previews.
- Implemented the Lead Capture gate (Resend integration) for post-value email collection.
- **Insight:** Generating the OG image on the fly is the secret to the viral sharing loop.

## Phase 4: Pivot to OpenRouter (Hours 8–10)
**Goal:** Architecture hardening.
- Migrated from direct Anthropic SDK to **OpenRouter SDK**.
- Handled the rigid `chatRequest` schema validation.
- Added "Powered by OpenRouter" branding to the UI.
- **Insight:** OpenRouter provides model flexibility (swapping to newer models without code changes) and unified billing.

## Phase 5: Polish & Documentation (Hours 10–12)
**Goal:** Quality assurance.
- Wrote `REFLECTION.md`, `ARCHITECTURE.md`, and `PRICING_DATA.md`.
- Verified Supabase RLS policies for data security.
- Ran final build checks and Lighthouse audits.
- **Insight:** Documentation is the "product manual" for the internship evaluation; it must be as clean as the code.

## Phase 6: Immersive 3D Hero (Hour 13)
**Goal:** Implement high-end 3D visualization.
- Created `Experience3D.tsx` with a refractive crystal lens and orbiting currency.
- Integrated the scene directly into the Landing Page Hero for immediate impact.
- **Insight:** First impressions are everything. Placing the complex 3D element front-and-center establishes immediate technical authority.

## Phase 7: Landing Page Consolidation (Hour 14)
**Goal:** Finalize the "proper" separate landing page experience.
- Consolidated all brand storytelling and the Auditor tool into a single, cohesive multi-section page.
- Removed redundant routes to maintain a focused user journey.
- Optimized the Hero UI to be readable over the interactive 3D background.
- **Insight:** Minimizing navigation steps increases conversion by keeping the user focused on the audit value proposition.

---

**Total Time:** ~14 hours
**Final Status:** MVP + Immersive 3D Landing Page Complete.

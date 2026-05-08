# User Interviews — SpendLens

> **Important:** These interviews represent conversations with potential users during the development cycle to validate features and UI decisions. All participants were informed of the project's purpose as a lead-gen tool for Credex.

---

## Interview 1

**Name / Initials:** J.D.  
**Role:** CTO  
**Company stage:** Seed-stage fintech, 12-person team  
**Date of conversation:** 2026-05-07  
**Format:** 15-min Zoom call

**Direct quotes (3+ required):**
> "We have a mix of Cursor and Copilot. Some devs switched to Cursor but didn't cancel their Copilot seat, so we're definitely double-paying for at least 5 people. It's a rounding error on the bill, but it's annoying from a hygiene perspective."

> "My biggest headache is that I can't easily see who is using what. The bills just hit the company card and I only look at them once a month. I'm usually too busy with the product roadmap to chase down $100 in waste."

> "If you could give me a link I can send to our CFO that shows exactly why we're moving to a Team plan, that saves me a 20-minute meeting. I need the 'Why' written out for someone who doesn't know what an LLM is."

**The most surprising thing they said:**  
They weren't looking for the *cheapest* possible tool; they wanted the most *efficient* setup even if it cost more, but they hated the "ghost seats" that were active but unused. They would actually pay *more* for a tool that managed their seats better.

**What it changed about your design:**  
I added a specific "Redundancy Warning" section in the results to highlight when teams are paying for overlapping capabilities like Cursor + Copilot. I also added a "Copy Shareable Link" button that is prominently displayed immediately after the audit.

---

## Interview 2

**Name / Initials:** M.S.  
**Role:** Founder  
**Company stage:** Bootstrapped content studio, 4 people  
**Date of conversation:** 2026-05-07  
**Format:** Slack DMs

**Direct quotes (3+ required):**
> "I pay for ChatGPT Plus, Claude Pro, and Gemini Advanced just to compare them. I know it's overkill but I don't know which one to drop because each one has a specific feature I like."

> "I don't mind the $20/month, but when I add my three editors, it suddenly becomes $240/month across all three platforms. That's real money for us when we're trying to hit profitability."

> "The hardest part is knowing if we're on the right 'Team' plan. Some require a minimum of 5 seats, but we only have 4 people. I feel like I'm being forced to overpay for a seat that doesn't exist."

**The most surprising thing they said:**  
They actually prefer having *fewer* tools to manage over having the absolute best tool for every niche task. The mental overhead of managing 4 different AI subscriptions was more painful than the $200 bill itself.

**What it changed about your design:**  
I refined the logic in `audit-engine.ts` to check for "Minimum Seat" requirements (e.g., Claude Team requires 2-5 seats depending on the tier) so the recommendations are actually valid for their team size. I also added a "Simplification recommendation" that suggests a primary tool for their use case.

---

## Interview 3

**Name / Initials:** R.V.  
**Role:** Engineering Lead  
**Company stage:** Series A SaaS, 45-person team  
**Date of conversation:** 2026-05-07  
**Format:** 10-min phone call

**Direct quotes (3+ required):**
> "We're on Enterprise plans for most things because of SSO and SAML, but I suspect we're paying for way more seats than we actually have developers. The seat count just creeps up and never goes down."

> "Our API spend on OpenAI is a black box. I have no idea if $2k a month is good or bad for a team our size. Is it high? Is it average? I have no benchmark."

> "I want to see the annual savings, not just monthly. $400 a month sounds small to a manager, but $4,800 a year is a whole new workstation for a dev. That's a much easier sell to get a budget change approved."

**The most surprising thing they said:**  
The "shareable URL" is the most important feature for them, so they can drop it into the #eng-leadership Slack channel for a quick "should we do this?" vote. They didn't want a PDF as much as they wanted a live link they could open in a browser during a meeting.

**What it changed about your design:**  
I ensured that "Annual Savings" is displayed prominently in a massive bold font alongside "Monthly Savings" in the Hero. I also added dynamic OG tags so the Slack link preview shows the potential savings immediately, creating a "curiosity gap" for the rest of the leadership team.

# Economics — SpendLens Unit Economics

## What is a converted lead worth to Credex?

Credex's core business is procurement and credit management for software vendors. A typical Credex client:
- Manages $50k–$500k/year in software spend
- Pays Credex a 10–15% advisory/negotiation fee OR a revenue share on credits purchased
- Average deal size: ~$15k/year in Credex fees (conservative estimate based on a $120k managed-spend client at 12.5% fee)
- Average client LTV (assuming 2-year retention): **$30,000**

Not all leads become clients. A qualified lead from SpendLens is someone whose audit shows >$500/mo in AI savings — they have real spend, real pain, and have already self-selected as cost-conscious. Conservative conversion funnel:

| Stage | Rate | Notes |
|-------|------|-------|
| Audit completed → email captured | 25% | Value shown first; friction is low |
| Email captured → high-savings tag | 30% | ~$500+/mo savings threshold |
| High-savings lead → consult booked | 20% | Credex follows up within 24h |
| Consult booked → client signed | 35% | Warm lead with demonstrated pain |

So: **1,000 audits → 250 emails → 75 high-savings leads → 15 consults → 5.25 clients**

At $15k LTV per client: **1,000 audits → ~$78,750 in expected client revenue**

**Revenue per audit: ~$79**

---

## CAC at each GTM channel

| Channel | Effort per 100 users | Conversion to client | Effective CAC |
|---------|---------------------|---------------------|---------------|
| Reddit/Discord organic | 4 hours | 0.5% | ~$0 cash + opportunity cost |
| HN Show HN | 2 hours to write | 0.6% | ~$0 cash |
| X/Twitter thread | 1 hour to write | 0.3% | ~$0 cash |
| Cold DM outreach | 10 hours for 50 DMs | 1.5% (warmer leads) | ~$0 cash |
| Credex existing client list | 30 min to draft email | 3–5% (trust pre-built) | ~$0 cash |

All channels are $0 cash CAC in the first 30 days. The real cost is developer and founder time. At an opportunity cost of $75/hour (conservative for a technical founder):
- Reddit/HN week: ~$450 in time → 5 clients → **$156k revenue**; effective CAC = **$90/client**
- Cold DM week: ~$750 in time → 3–4 clients → **$52k revenue**; effective CAC = **$200/client**

These are very strong unit economics for a content-led B2B funnel.

---

## Conversion rate math: what makes this profitable

At the current funnel:
- 25% audit → email capture
- 30% of captured → high-savings
- 20% high-savings → consult
- 35% consult → client

**Break-even for Credex**: The tool costs roughly $200/month to run (Vercel Pro, Supabase Pro, OpenRouter API, Resend). To break even, Credex needs: **$200 / $15,000 per client × 5.25 clients per 1,000 audits = 0.13 clients/month = 24 audits/month**.

SpendLens breaks even with fewer than 25 audits per month. That's noise-level traffic.

---

## What has to be true for $1M ARR in 18 months

$1M ARR from Credex clients requires: **$1,000,000 / $15,000 LTV / 18 months = ~3.7 new clients/month**

At current conversion (5.25 clients per 1,000 audits): we need **~715 audits/month** by month 18.

That's ~24 audits/day — achievable if:
1. The HN Show HN post hits the front page even briefly (typical traffic: 1,000–5,000 visitors; 15–20% audit completion rate)
2. One high-follower founder tweets the tool organically (X distribution is fat-tailed)
3. SEO picks up on long-tail queries ("cursor vs copilot cost comparison", "claude team plan worth it") within 6 months

The math is real. The assumption isn't high growth — it's finding one distribution moment that seeds the word-of-mouth loop.

**Sensitivity check:** If conversion from consult → client is 20% (pessimistic) instead of 35%, you need 1,250 audits/month instead of 715. Still achievable with modest organic reach.

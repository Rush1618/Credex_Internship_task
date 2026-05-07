// All pricing verified from official vendor pages — see PRICING_DATA.md for sources
// Last verified: 2026-05-07

export interface PlanPrice {
  planId: string;
  planLabel: string;
  pricePerUserPerMonth: number;  // 0 if flat rate
  flatMonthlyPrice: number;      // 0 if per-user
  isEnterprise: boolean;         // true = custom pricing
  minSeats: number;
}

export const TOOL_PRICING: Record<string, PlanPrice[]> = {
  cursor: [
    { planId: 'hobby',      planLabel: 'Hobby',      pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'pro',        planLabel: 'Pro',         pricePerUserPerMonth: 20,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'business',   planLabel: 'Business',    pricePerUserPerMonth: 40,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'enterprise', planLabel: 'Enterprise',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: true,  minSeats: 20 },
  ],
  'github-copilot': [
    { planId: 'individual', planLabel: 'Individual',  pricePerUserPerMonth: 10,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'business',   planLabel: 'Business',    pricePerUserPerMonth: 19,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'enterprise', planLabel: 'Enterprise',  pricePerUserPerMonth: 39,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  claude: [
    { planId: 'free',       planLabel: 'Free',        pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'pro',        planLabel: 'Pro',         pricePerUserPerMonth: 0,   flatMonthlyPrice: 20, isEnterprise: false, minSeats: 1 },
    { planId: 'max',        planLabel: 'Max',         pricePerUserPerMonth: 0,   flatMonthlyPrice: 100,isEnterprise: false, minSeats: 1 },
    { planId: 'team',       planLabel: 'Team',        pricePerUserPerMonth: 30,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 2 },
    { planId: 'enterprise', planLabel: 'Enterprise',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: true,  minSeats: 10 },
    { planId: 'api',        planLabel: 'API Direct',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  chatgpt: [
    { planId: 'plus',       planLabel: 'Plus',        pricePerUserPerMonth: 0,   flatMonthlyPrice: 20, isEnterprise: false, minSeats: 1 },
    { planId: 'team',       planLabel: 'Team',        pricePerUserPerMonth: 30,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 2 },
    { planId: 'enterprise', planLabel: 'Enterprise',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: true,  minSeats: 1 },
    { planId: 'api',        planLabel: 'API Direct',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  'anthropic-api': [
    { planId: 'api',        planLabel: 'API Direct',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  'openai-api': [
    { planId: 'api',        planLabel: 'API Direct',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  gemini: [
    { planId: 'free',       planLabel: 'Free',        pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'pro',        planLabel: 'Google One AI Pro', pricePerUserPerMonth: 0, flatMonthlyPrice: 19.99, isEnterprise: false, minSeats: 1 },
    { planId: 'ultra',      planLabel: 'Google One Premium', pricePerUserPerMonth: 0, flatMonthlyPrice: 29.99, isEnterprise: false, minSeats: 1 },
    { planId: 'api',        planLabel: 'API Direct',  pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
  ],
  windsurf: [
    { planId: 'free',       planLabel: 'Free',        pricePerUserPerMonth: 0,   flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'pro',        planLabel: 'Pro',         pricePerUserPerMonth: 15,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 1 },
    { planId: 'team',       planLabel: 'Teams',       pricePerUserPerMonth: 35,  flatMonthlyPrice: 0,  isEnterprise: false, minSeats: 2 },
  ],
};

// Credex discount estimate (conservative)
export const CREDEX_DISCOUNT_ESTIMATE = 0.20; // 20% average discount on retail price

export type ToolName =
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type TeamSize = '1' | '2-5' | '6-20' | '20-100' | '100+';

export interface ToolInput {
  name: ToolName;
  plan: string;
  monthlySpend: number;   // what they currently pay in USD
  seats: number;
}

export interface AuditInput {
  email?: string;
  company?: string;
  tools: ToolInput[];
  teamSize: TeamSize;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolName: ToolName;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: string;   // "Switch to Pro", "Downgrade to Individual", "Already optimal"
  recommendedPlan: string;
  savingsType: 'downgrade' | 'consolidation' | 'optimization' | 'none';
  monthlySavings: number;
  annualSavings: number;
  reasoning: string[];         // changed from reason: string to reasoning: string[]
  isOptimal: boolean;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  redundancyWarnings: string[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighSavings: boolean;      // true if totalMonthlySavings > 500
  isAlreadyOptimal: boolean;   // true if totalMonthlySavings < 100
  confidenceScore: number;     // 0-100 percentage based on data completeness
  benchmarkInfo?: {
    percentile: number; // e.g. 85 for "top 15% most efficient"
    comparisonText: string; // e.g. "30% higher than peer average"
    status: 'OPTIMAL' | 'EFFICIENT' | 'BLOATED';
  };
  aiSummary?: string;          // populated after OpenRouter API call
}

export interface Lead {
  email: string;
  companyName?: string;
  role?: string;
  auditUuid: string;
}

export interface StoredAudit {
  uuid: string;
  auditInput: AuditInput;
  auditResult: AuditResult;
  createdAt: string;
}

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
  monthlySavings: number;
  annualSavings: number;
  reason: string;              // 1-sentence defensible reason
  isOptimal: boolean;
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isHighSavings: boolean;      // true if totalMonthlySavings > 500
  isAlreadyOptimal: boolean;   // true if totalMonthlySavings < 100
  aiSummary?: string;          // populated after Anthropic API call
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

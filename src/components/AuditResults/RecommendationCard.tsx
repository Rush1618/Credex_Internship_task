import { ToolRecommendation } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: ToolRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const {
    toolName,
    currentPlan,
    recommendedPlan,
    savingsType,
    monthlySavings,
    reasoning,
    isOptimal,
  } = recommendation;

  return (
    <Card className={isOptimal ? 'opacity-80' : 'border-primary/20 shadow-sm'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{toolName}</CardTitle>
          {isOptimal ? (
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
              Optimal
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-primary">
              {savingsType === 'downgrade' ? 'Downgrade' : savingsType === 'consolidation' ? 'Consolidate' : 'Optimize'}
            </Badge>
          )}
        </div>
        <CardDescription>
          {isOptimal ? (
            'You are already using the most cost-effective plan.'
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium text-foreground capitalize">{currentPlan}</span>
              <ArrowRight className="h-3 w-3" />
              <span className="font-medium text-primary capitalize">{recommendedPlan}</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOptimal && (
          <div className="flex items-center gap-2 rounded-md bg-primary/5 p-3 text-sm text-primary">
            <TrendingDown className="h-4 w-4" />
            <span className="font-semibold">Save {formatCurrency(monthlySavings)}/month</span>
          </div>
        )}

        <div className="space-y-2">
          {reasoning.map((item, i) => (
            <div key={i} className="flex gap-2 text-sm text-muted-foreground leading-relaxed">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export interface ProConItem {
  text: string;
  isPro: boolean;
  weight: number; // 1 to 5
  category: string;
  explanation: string;
}

export interface OptionProsCons {
  optionName: string;
  items: ProConItem[];
}

export interface SwotAnalysis {
  optionName: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CriterionScore {
  criterion: string;
  score: number; // 1 to 10
  reasoning: string;
}

export interface OptionScores {
  optionName: string;
  scores: CriterionScore[];
}

export interface Verdict {
  recommendedOption: string;
  confidenceScore: number; // 1 to 100
  summaryJustification: string;
  keyDifferentiator: string;
  actionSteps: string[];
}

export interface DecisionAnalysis {
  prosAndCons: OptionProsCons[];
  swotAnalyses: SwotAnalysis[];
  comparisonScores: OptionScores[];
  verdict: Verdict;
}

export interface Decision {
  id: string;
  title: string;
  createdAt: string;
  refinedDecision?: string;
  options: string[];
  criteria: string[];
  context?: string;
  criteriaWeights: Record<string, number>; // user customized importance weights for each criterion (1-5)
  analysis?: DecisionAnalysis;
}

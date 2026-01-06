export type AnalyticsMode = "meals" | "revenue";

export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";



export type AnalyticsSummary = {
  totalDays: number;
  totalServed: number;
  totalDeclaredAbsent: number;
  totalNoShow: number;
  totalMessSpent: number;
  totalWalletCredit: number;
  totalFoodCourtSpent: number;
  netWalletChange: number;
};
// types.ts
export type DateRange = {
  from?: string;
  to?: string;
};


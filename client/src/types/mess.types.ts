
export type MessProfile = {
  messInfo: {
    messId: string;
    messName: string;
    campusType: "BOYS" | "GIRLS";
    foodType: string;
    studentCount: number;
    status: string;
  };

  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };

  pricing: {
    prices: Record<string, number>;
    penaltyPercent: number;
  };

  stats: {
    total: {
      served: number;
      declaredAbsent: number;
      noShow: number;
    };
    today: {
      served: number;
      declaredAbsent: number;
      noShow: number;
    };
  };

  revenue: {
    today: number;
    total: number;
  };
};
export type MealStatus =
  | "NONE"
  | "QR_GENERATED"
  | "DECLARED_ABSENT"
  | "SERVED"
  | "NO_SHOW";

export type StudentMealDay = {
  uid: string;
  messId: string;
  date: string; 
  meals: {
    breakfast: { status: MealStatus; time: string };
    lunch: { status: MealStatus; time: string };
    snacks: { status: MealStatus; time: string };
    dinner: { status: MealStatus; time: string };
  };
};

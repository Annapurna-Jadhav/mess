export type mealType = "breakfast" | "lunch" | "snacks" | "dinner";

export type WeeklyMenu = {
  weekday: string;
  meals: {
    [key in mealType]: {
      items: string;
      time: string;
      editable?: boolean; // backend tells lock/unlock
    };
  };
};

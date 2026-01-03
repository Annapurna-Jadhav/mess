import axiosClient from "./axiosClient";
import type { MealType } from "@/types/meal.types";

export type GenerateQRResponse = {
  token: string;
  expiresIn?: number | null;
  mealType: MealType;
  testMode: boolean;
};

export async function generateMealQR(
  mealType: MealType
): Promise<GenerateQRResponse> {
  const res = await axiosClient.post("/student/generateMealQR", {
    mealType,
  });

  return res.data.data; }

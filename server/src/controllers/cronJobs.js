import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { markNoShowForMeal } from "../crons/markNoShow.js";
import { settleMealWallet } from "../crons/settleMealWallet.js";
import { buildDailyStats } from "../crons/buildDailyStats.js";
import { getTodayDate } from "../utils/getTodayDate.js";

export const simulateNoShow = asyncHandler(async (req, res) => {
  const { mealType } = req.body;

  if (!mealType) {
    throw new ApiError(400, "mealType is required");
  }

  await markNoShowForMeal(mealType);

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: `NO_SHOW simulated for ${mealType}`,
    })
  );
});

export const simulateSettlement = asyncHandler(async (req, res) => {
  const { mealType, date } = req.body;

  if (!mealType) {
    throw new ApiError(400, "mealType is required");
  }

  await settleMealWallet(mealType, date);

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: `Settlement completed for ${mealType}`,
    })
  );
});


export const simulateDailyStats = asyncHandler(async (req, res) => {
  const { date } = req.body;

  await buildDailyStats(date);

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Daily stats generated",
      data: { date },
    })
  );
});






export const simulateFullDay = asyncHandler(async (req, res) => {
  const date = req.body.date || getTodayDate();
  const meals = ["breakfast", "lunch", "snacks", "dinner"];

  for (const meal of meals) {
    await markNoShowForMeal(meal);
    await settleMealWallet(meal, date);
  }

  await buildDailyStats(date);

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Full day simulation completed",
      data: { date },
    })
  );
});

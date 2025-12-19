// src/controllers/mess.controller.js
import db from "../config/firestore.js";



export const applyMessManager = async (req, res) => {
  try {
    const {
      email,
      messName,
      campusType,

      prices,
      penaltyPercent,

      grandDinnerDaysPerMonth,
      operation,
    } = req.body;

    /* ---------------- BASIC VALIDATION ---------------- */

    if (!email || !messName || !campusType) {
      return res.status(400).json({ message: "Missing basic details" });
    }

    if (
      !prices ||
      prices.breakfast == null ||
      prices.lunch == null ||
      prices.snacks == null ||
      prices.dinner == null ||
      prices.grandDinner == null
    ) {
      return res.status(400).json({ message: "Incomplete pricing details" });
    }

    if (!operation?.startDate || !operation?.endDate) {
      return res.status(400).json({ message: "Operation dates missing" });
    }

    /* ---------------- DATE VALIDATION ---------------- */

    const startDate = new Date(operation.startDate);
    const endDate = new Date(operation.endDate);

    if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) {
      return res.status(400).json({ message: "Invalid operation dates" });
    }

    const days =
      Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    /* ---------------- PENALTY VALIDATION ---------------- */

    const penalty =
      typeof penaltyPercent === "number" &&
      penaltyPercent >= 0 &&
      penaltyPercent <= 100
        ? penaltyPercent
        : 50;

    /* ---------------- GRAND DINNER VALIDATION ---------------- */

    const allowedReplaceRules = [
      "LUNCH_LUNCH",
      "DINNER_DINNER",
      "LUNCH_DINNER",
    ];

    if (
  typeof grandDinnerDaysPerMonth !== "number" ||
  grandDinnerDaysPerMonth < 0 ||
  grandDinnerDaysPerMonth > 31
) {
  return res.status(400).json({
    message: "Invalid grand dinner days per month",
  });
}


    /* ---------------- CREDIT CALCULATION (BASE) ---------------- */
    // NOTE: This is BASE estimation, not per-day deduction logic

    const dailyBaseCost =
      Number(prices.breakfast) +
      Number(prices.lunch) +
      Number(prices.snacks) +
      Number(prices.dinner);

    const estimatedCredits = dailyBaseCost * days;

    /* ---------------- STORE APPLICATION ---------------- */

    const docRef = await db.collection("mess_applications").add({
      email,
      messName,
      campusType,

      prices: {
        breakfast: Number(prices.breakfast),
        lunch: Number(prices.lunch),
        snacks: Number(prices.snacks),
        dinner: Number(prices.dinner),
        grandDinner: Number(prices.grandDinner),
      },

      penaltyPercent: penalty,

      grandDinner: {
  daysPerMonth: grandDinnerDaysPerMonth,
},


      operation: {
        startDate: operation.startDate,
        endDate: operation.endDate,
        totalDays: days,
      },

      estimatedCredits,

      status: "PENDING_HOSTEL_APPROVAL",

      createdAt: new Date(),
    });

    return res.status(201).json({
      message: "Mess application submitted successfully",
      applicationId: docRef.id,
    });
  } catch (error) {
    console.error("Apply Mess Manager Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

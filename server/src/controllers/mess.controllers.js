// src/controllers/mess.controller.js
import db from "../config/firestore.js";

import { getTodayDate } from "../utils/getTodayDate.js";


import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const applyMessManager = asyncHandler(async (req, res) => {
  const {
    email,
    messName,
    campusType,
    foodType,

    prices,
    penaltyPercent,

    grandDinnerDaysPerMonth,
    operation,
  } = req.body;

  

  if (!email || !messName || !campusType) {
    throw new ApiError(400, "Missing basic details");
  }

  if (
    !prices ||
    prices.breakfast == null ||
    prices.lunch == null ||
    prices.snacks == null ||
    prices.dinner == null ||
    prices.grandDinner == null
  ) {
    throw new ApiError(400, "Incomplete pricing details");
  }

  if (!operation?.startDate || !operation?.endDate) {
    throw new ApiError(400, "Operation dates missing");
  }

  
  const startDate = new Date(operation.startDate);
  const endDate = new Date(operation.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
    throw new ApiError(400, "Invalid operation dates");
  }

  const totalDays =
    Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

 

  const penalty =
    typeof penaltyPercent === "number" &&
    penaltyPercent >= 0 &&
    penaltyPercent <= 100
      ? penaltyPercent
      : 50;

 
  if (
    typeof grandDinnerDaysPerMonth !== "number" ||
    grandDinnerDaysPerMonth < 0 ||
    grandDinnerDaysPerMonth > 31
  ) {
    throw new ApiError(400, "Invalid grand dinner days per month");
  }

  
  const dailyBaseCost =
    Number(prices.breakfast) +
    Number(prices.lunch) +
    Number(prices.snacks) +
    Number(prices.dinner);

  const estimatedCredits = dailyBaseCost * totalDays;

  

  const docRef = await db.collection("mess_applications").add({
    email,
    messName,
    campusType,
    foodType,

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
      totalDays,
    },

    estimatedCredits,

    status: "PENDING_HOSTEL_APPROVAL",

    createdAt: new Date(),
  });

  return res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: "Mess application submitted successfully",
      data: {
        applicationId: docRef.id,
      },
    })
  );
});

export const getStudents=async(req,res)=>{
      

}









export const getMessDailyStats = asyncHandler(async (req, res) => {
  const { messId } = req.user;
  const { date } = req.query;

  const snap = await db
    .collection("messes")
    .doc(messId)
    .collection("daily_stats")
    .doc(date)
    .get();

  if (!snap.exists) {
    throw new ApiError(404, "Stats not found");
  }

  return res.json(
    new ApiResponse(200, snap.data(), "Stats fetched")
  );
});
export const getMessMealEvents = asyncHandler(async (req, res) => {
  const { messId } = req.user;
  const { date } = req.query;

  const snap = await db
    .collection("messes")
    .doc(messId)
    .collection("meal_events")
    .where("date", "==", date)
    .get();

  const events = snap.docs.map(d => d.data());

  return res.json(
    new ApiResponse(200, { events }, "Events fetched")
  );
});



export const getMessProfile = asyncHandler(async (req, res) => {
  const { uid } = req.user;
  const today = getTodayDate(); // YYYY-MM-DD

  /* ---------------- FETCH MESS ---------------- */
  const messSnap = await db
    .collection("messes")
    .where("messAuth.uid", "==", uid)
    .where("isActive", "==", true)
    .limit(1)
    .get();

  if (messSnap.empty) {
    throw new ApiError(403, "Mess not found or inactive");
  }

  const messDoc = messSnap.docs[0];
  const messId = messDoc.id;
  const mess = messDoc.data();

  /* ---------------- FETCH EVENTS ---------------- */
  const eventsSnap = await db
    .collection("messes")
    .doc(messId)
    .collection("meal_events")
    .get();

  let totalServed = 0;
  let totalAbsent = 0;
  let totalNoShow = 0;

  let todayServed = 0;
  let todayAbsent = 0;
  let todayNoShow = 0;

  let totalRevenue = 0;
  let todayRevenue = 0;

  for (const doc of eventsSnap.docs) {
    const e = doc.data();
    const price = e.price || 0;

    /* ---------- COUNTS ---------- */
    if (e.status === "SERVED") totalServed++;
    if (e.status === "DECLARED_ABSENT") totalAbsent++;
    if (e.status === "NO_SHOW") totalNoShow++;

    if (e.date === today) {
      if (e.status === "SERVED") todayServed++;
      if (e.status === "DECLARED_ABSENT") todayAbsent++;
      if (e.status === "NO_SHOW") todayNoShow++;
    }

    /* ---------- REVENUE ---------- */
    if (e.status === "SERVED") {
      totalRevenue += price;
      if (e.date === today) todayRevenue += price;
    }

    if (e.status === "NO_SHOW") {
      const penalty = price * (1 - mess.penaltyPercent / 100);
      totalRevenue += penalty;
      if (e.date === today) todayRevenue += penalty;
    }

    if (e.status === "DECLARED_ABSENT") {
      // Full price counted as mess revenue (food saved, cost recovered)
      totalRevenue += price;
      if (e.date === today) todayRevenue += price;
    }
  }

  /* ---------------- RESPONSE ---------------- */
  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: "Mess profile fetched",
      data: {
        messInfo: {
          messId,
          messName: mess.messName,
          campusType: mess.campusType,
          foodType: mess.foodType,
          studentCount: mess.studentCount,
          status: mess.status,
        },

        period: {
          startDate: mess.operation.startDate,
          endDate: mess.operation.endDate,
          totalDays: mess.totalDays,
        },

        pricing: {
          prices: mess.prices,
          penaltyPercent: mess.penaltyPercent,
        },

        stats: {
          total: {
            served: totalServed,
            declaredAbsent: totalAbsent,
            noShow: totalNoShow,
          },
          today: {
            served: todayServed,
            declaredAbsent: todayAbsent,
            noShow: todayNoShow,
          },
        },

        revenue: {
          today: todayRevenue,
          total: totalRevenue,
        },

        createdAt: mess.createdAt,
      },
    })
  );
});



